export type Condition = {
  temp?: number|null;
  rpm?: number|null;
  gas?: string|null;
  media?: string|null;
};

export type Plan = {
  condition: Condition;
  start_planned: string; // ISO UTC
  end_planned: string;   // ISO UTC
  alerts?: { t_minus: number[] }; // minutes before end
};

export type Actual = {
  start_actual?: string|null;
  end_actual?: string|null;
  deviation_reason?: string|null;
  operator?: string|null;
  attachments?: string[];
};

export type Sample = {
  id: string;
  batch_id: string;
  container?: string;
  location?: string;
  labels?: string[];
  plate_pos?: string; // e.g., A1
  plan: Plan;
  actual?: Actual;
  calendar_link?: {
    google_event_id?: string;
    outlook_event_id?: string;
  };
  audit?: AuditEntry[];
};

export type AuditEntry = {
  ts: string; // ISO
  who: string;
  action: string;
  details?: Record<string, any>;
};

export type Batch = {
  id: string;
  name: string;
  project?: string;
  created_at: string; // ISO
  plate_type?: "6" | "24" | "96" | "custom";
  samples: Sample[];
};
