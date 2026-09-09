export type AgentRole = 'planner' | 'executor' | 'critic';
export type StepStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped';
export type InvestigationMode = 'mock' | 'live' | 'cache';

export interface Step {
  id: string;
  role: AgentRole;
  title: string;
  status: StepStatus;
  detail?: string;
}

export interface BrokerRow {
  broker_code: string;
  broker_name: string;
  net_value: number;
  buy_value: number;
  sell_value: number;
  rank: number;
}

export interface Brokers {
  top_buyers: BrokerRow[];
  top_sellers: BrokerRow[];
}

export interface FreeFloat {
  percent: number | null;
  shares: number | null;
  as_of?: string | null;
  note?: string | null;
}

export interface InvestigateError {
  code: string;
  message: string;
}

export interface InvestigateResponse {
  ticker: string;
  mode: InvestigationMode;
  as_of?: string | null;
  credit_estimate?: number | null;
  steps: Step[];
  brokers: Brokers;
  free_float: FreeFloat;
  narrative: string;
  disclaimer: string;
  error?: InvestigateError | null;
}

export interface InvestigateRequest {
  ticker: string;
  mode?: InvestigationMode;
}
