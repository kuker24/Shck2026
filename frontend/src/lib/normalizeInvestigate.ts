import { COPY } from '@/constants/copy';
import {
  AgentRole,
  BrokerRow,
  InvestigateError,
  InvestigateResponse,
  InvestigationMode,
  Step,
  StepStatus,
} from '@/types/investigate';

function rec(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  // SAFETY: non-null object and not an array; JSON bodies are string-key records.
  return value as Record<string, unknown>;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toRole(value: unknown): AgentRole {
  if (value === 'planner' || value === 'executor' || value === 'critic') return value;
  return 'executor';
}

function toStatus(value: unknown): StepStatus {
  if (
    value === 'pending' ||
    value === 'running' ||
    value === 'done' ||
    value === 'error' ||
    value === 'skipped'
  ) {
    return value;
  }
  return 'done';
}

function toMode(value: unknown): InvestigationMode {
  if (value === 'mock' || value === 'live' || value === 'cache') return value;
  return 'mock';
}

function toBrokerRow(value: unknown, index: number): BrokerRow | null {
  const row = rec(value);
  if (!row) return null;
  const code = str(row.broker_code).trim();
  if (!code) return null;
  return {
    broker_code: code,
    broker_name: str(row.broker_name, code),
    net_value: num(row.net_value),
    buy_value: num(row.buy_value),
    sell_value: num(row.sell_value),
    rank: typeof row.rank === 'number' ? row.rank : index + 1,
  };
}

function toBrokerList(value: unknown): BrokerRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => toBrokerRow(item, index))
    .filter((item): item is BrokerRow => item !== null);
}

function toSteps(value: unknown): Step[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row = rec(item);
    return {
      id: str(row?.id, `s${index + 1}`),
      role: toRole(row?.role),
      title: str(row?.title, 'Langkah'),
      status: toStatus(row?.status),
      detail: row?.detail === undefined || row?.detail === null ? undefined : str(row.detail),
    };
  });
}

function toError(value: unknown): InvestigateError | undefined {
  const row = rec(value);
  if (!row) return undefined;
  const message = str(row.message).trim();
  if (!message) return undefined;
  return {
    code: str(row.code, 'UNKNOWN'),
    message,
  };
}

export function normalizeInvestigateResponse(
  raw: unknown,
  fallbackTicker: string
): InvestigateResponse {
  const body = rec(raw);
  const brokers = rec(body?.brokers);
  const freeFloat = rec(body?.free_float);
  const ticker = str(body?.ticker, fallbackTicker).toUpperCase().trim() || fallbackTicker;
  const percentRaw = freeFloat?.percent;
  const sharesRaw = freeFloat?.shares;

  return {
    ticker,
    mode: toMode(body?.mode),
    as_of: typeof body?.as_of === 'string' ? body.as_of : null,
    credit_estimate: typeof body?.credit_estimate === 'number' ? body.credit_estimate : null,
    steps: toSteps(body?.steps),
    brokers: {
      top_buyers: toBrokerList(brokers?.top_buyers),
      top_sellers: toBrokerList(brokers?.top_sellers),
    },
    free_float: {
      percent: typeof percentRaw === 'number' && Number.isFinite(percentRaw) ? percentRaw : null,
      shares: typeof sharesRaw === 'number' && Number.isFinite(sharesRaw) ? sharesRaw : null,
      as_of: typeof freeFloat?.as_of === 'string' ? freeFloat.as_of : null,
      note: typeof freeFloat?.note === 'string' ? freeFloat.note : null,
    },
    narrative: str(body?.narrative),
    disclaimer: str(body?.disclaimer, COPY.disclaimer_long),
    error: toError(body?.error),
  };
}
