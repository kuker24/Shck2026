import { InvestigateRequest, InvestigateResponse, Step } from '@/types/investigate';
import { COPY } from '@/constants/copy';
import mockBBCA from '@/data/mocks/investigate_bbca.json';
import mockEmpty from '@/data/mocks/investigate_empty.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });

class InvestigateHttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'InvestigateHttpError';
    this.status = status;
  }
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError')
  );
}

function field(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;
  // SAFETY: object guard above; JSON bodies are string-key records.
  return (obj as Record<string, unknown>)[key];
}

function readApiErrorMessage(body: unknown, status: number): string {
  const fallback = `Permintaan ditolak (${status})`;
  const direct = field(field(body, 'error'), 'message');
  if (typeof direct === 'string' && direct.trim()) return direct;
  const detail = field(body, 'detail');
  if (typeof detail === 'string' && detail.trim()) return detail;
  const nested = field(field(detail, 'error'), 'message');
  if (typeof nested === 'string' && nested.trim()) return nested;
  return fallback;
}

function emptyErrorResponse(
  ticker: string,
  mode: InvestigateResponse['mode'],
  code: string,
  message: string
): InvestigateResponse {
  return {
    ticker,
    mode,
    brokers: { top_buyers: [], top_sellers: [] },
    free_float: { percent: null, shares: null },
    narrative: '',
    disclaimer: COPY.disclaimer_long,
    steps: [],
    error: { code, message },
  };
}

export async function runInvestigation(
  req: InvestigateRequest,
  onStepProgress?: (steps: Step[]) => void,
  signal?: AbortSignal
): Promise<InvestigateResponse> {
  const ticker = req.ticker.toUpperCase().trim();
  const requestedMode = req.mode || 'mock';

  if (!API_BASE_URL) {
    const simulated = await simulateMockInvestigation(
      ticker,
      requestedMode === 'live' ? 'mock' : requestedMode,
      onStepProgress,
      signal
    );
    return simulated;
  }

  try {
      const stepsState: Step[] = [
        {
          id: 's1',
          role: 'planner',
          title: COPY.step_planner,
          status: 'running',
          detail: `Menyusun permintaan untuk ${ticker}`,
        },
        {
          id: 's2',
          role: 'executor',
          title: COPY.step_executor_broker,
          status: 'pending',
          detail: `Mengambil ringkasan broker ${ticker}`,
        },
        {
          id: 's3',
          role: 'executor',
          title: COPY.step_executor_ff,
          status: 'pending',
          detail: `Mengambil free float ${ticker}`,
        },
        {
          id: 's4',
          role: 'critic',
          title: COPY.step_critic,
          status: 'pending',
          detail: 'Memeriksa penafian non-rekomendasi',
        },
      ];

      if (onStepProgress) onStepProgress([...stepsState]);

      const fetchPromise = fetch(`${API_BASE_URL}/v1/investigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          mode: requestedMode,
        }),
        signal,
      });

      await delay(250, signal);
      stepsState[0].status = 'done';
      stepsState[1].status = 'running';
      if (onStepProgress) onStepProgress([...stepsState]);

      await delay(300, signal);
      const response = await fetchPromise;
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new InvestigateHttpError(
          response.status,
          readApiErrorMessage(errJson, response.status)
        );
      }

      const data: InvestigateResponse = await response.json();

      stepsState[1].status = data.error ? 'error' : 'done';
      stepsState[2].status = data.error ? 'skipped' : 'running';
      if (onStepProgress) onStepProgress([...stepsState]);

      // Animate Step 3 -> Step 4 (Critic)
      await delay(250, signal);
      stepsState[2].status = data.error ? 'skipped' : 'done';
      stepsState[3].status = 'running';
      if (onStepProgress) onStepProgress([...stepsState]);

      await delay(250, signal);
      stepsState[3].status = 'done';
      if (onStepProgress) onStepProgress([...stepsState]);

      return data;
  } catch (err: unknown) {
    if (isAbortError(err)) throw err;
    if (err instanceof InvestigateHttpError && err.status >= 400 && err.status < 500) {
      return emptyErrorResponse(ticker, requestedMode, `HTTP_${err.status}`, err.message);
    }
    console.warn('Backend API unavailable or error, falling back to mock mode:', err);
    const simulated = await simulateMockInvestigation(ticker, requestedMode, onStepProgress, signal);
    return {
      ...simulated,
      mode: 'mock',
    };
  }
}

function toStepRole(role: string): Step['role'] {
  if (role === 'planner' || role === 'executor' || role === 'critic') {
    return role;
  }
  return 'executor';
}

function toStepStatus(status: string): Step['status'] {
  if (
    status === 'pending' ||
    status === 'running' ||
    status === 'done' ||
    status === 'error' ||
    status === 'skipped'
  ) {
    return status;
  }
  return 'done';
}

function createMockResponse(
  raw: typeof mockBBCA | typeof mockEmpty,
  ticker: string,
  mode: InvestigateResponse['mode']
): InvestigateResponse {
  return {
    ticker,
    mode,
    brokers: {
      top_buyers: raw.brokers.top_buyers.map((b) => ({
        rank: b.rank,
        broker_code: b.broker_code,
        broker_name: b.broker_name,
        buy_value: b.buy_value,
        sell_value: b.sell_value,
        net_value: b.net_value,
      })),
      top_sellers: raw.brokers.top_sellers.map((s) => ({
        rank: s.rank,
        broker_code: s.broker_code,
        broker_name: s.broker_name,
        buy_value: s.buy_value,
        sell_value: s.sell_value,
        net_value: s.net_value,
      })),
    },
    free_float: {
      percent: raw.free_float.percent,
      shares: raw.free_float.shares,
      as_of: raw.free_float.as_of,
      note: raw.free_float.note,
    },
    narrative: raw.narrative,
    disclaimer: raw.disclaimer,
    steps: raw.steps.map((st) => ({
      id: st.id,
      role: toStepRole(st.role),
      title: st.title,
      status: toStepStatus(st.status),
      detail: st.detail,
    })),
    credit_estimate: raw.credit_estimate,
    error:
      'error' in raw && raw.error && typeof raw.error === 'object'
        ? {
            code: 'code' in raw.error && typeof raw.error.code === 'string' ? raw.error.code : 'UNKNOWN',
            message:
              'message' in raw.error && typeof raw.error.message === 'string'
                ? raw.error.message
                : 'Data tidak tersedia',
          }
        : undefined,
  };
}

async function simulateMockInvestigation(
  ticker: string,
  mode: 'mock' | 'live' | 'cache',
  onStepProgress?: (steps: Step[]) => void,
  signal?: AbortSignal
): Promise<InvestigateResponse> {
  const isBBCA = ticker === 'BBCA';

  const initialSteps: Step[] = [
    {
      id: 's1',
      role: 'planner',
      title: COPY.step_planner,
      status: 'pending',
      detail: isBBCA ? `Menyusun permintaan untuk ${ticker}` : 'Kode tidak dikenali atau data kosong',
    },
    {
      id: 's2',
      role: 'executor',
      title: COPY.step_executor_broker,
      status: 'pending',
      detail: isBBCA ? `Mengambil ringkasan broker ${ticker}` : 'Tidak ada data broker',
    },
    {
      id: 's3',
      role: 'executor',
      title: COPY.step_executor_ff,
      status: 'pending',
      detail: isBBCA ? `Mengambil free float ${ticker}` : 'Dilewati karena data broker gagal',
    },
    {
      id: 's4',
      role: 'critic',
      title: COPY.step_critic,
      status: 'pending',
      detail: isBBCA
        ? 'Tidak ada bahasa saran investasi; penafian dipasang'
        : 'Menampilkan keadaan kosong dan penafian',
    },
  ];

  if (onStepProgress) {
    const steps = [...initialSteps];

    // Step 1: Planner
    steps[0] = { ...steps[0], status: 'running' };
    onStepProgress([...steps]);
    await delay(300, signal);
    steps[0] = { ...steps[0], status: 'done' };

    steps[1] = { ...steps[1], status: 'running' };
    onStepProgress([...steps]);
    await delay(350, signal);
    steps[1] = { ...steps[1], status: isBBCA ? 'done' : 'error' };

    steps[2] = { ...steps[2], status: isBBCA ? 'running' : 'skipped' };
    onStepProgress([...steps]);
    if (isBBCA) {
      await delay(300, signal);
      steps[2] = { ...steps[2], status: 'done' };
    }

    steps[3] = { ...steps[3], status: 'running' };
    onStepProgress([...steps]);
    await delay(300, signal);
    steps[3] = { ...steps[3], status: 'done' };
    onStepProgress([...steps]);
  }

  // Construct response with type-safe boundary validation
  if (isBBCA) {
    return createMockResponse(mockBBCA, ticker, mode);
  } else {
    return createMockResponse(mockEmpty, ticker, mode);
  }
}
