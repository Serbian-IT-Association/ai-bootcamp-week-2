export type PreparationItem = Readonly<{
  id: number;
  title: string;
  completed: boolean;
}>;

export type PreparationSummary = Readonly<{
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}>;

export type HealthData = Readonly<{
  status: 'ok';
  environment: string;
  message: string;
  preparationServiceConfigured: boolean;
}>;

type ApiEnvelope<TData> = Readonly<{ data: TData }>;
type ApiErrorEnvelope = Readonly<{ error?: Readonly<{ message?: string }> }>;

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export async function getHealth(): Promise<HealthData> {
  const envelope = await getJson<ApiEnvelope<HealthData>>('/api/health');
  return envelope.data;
}

export async function getPreparationItems(): Promise<PreparationItem[]> {
  const envelope = await getJson<ApiEnvelope<{ items: PreparationItem[] }>>('/api/preparation-items');
  return envelope.data.items;
}

export async function getPreparationSummary(): Promise<PreparationSummary> {
  const envelope = await getJson<ApiEnvelope<PreparationSummary>>('/api/preparation-summaries');
  return envelope.data;
}

async function getJson<TBody>(path: string): Promise<TBody> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  const body = await response.json() as TBody | ApiErrorEnvelope;

  if (!response.ok) {
    const errorEnvelope = body as ApiErrorEnvelope;
    throw new ApiRequestError(response.status, errorEnvelope.error?.message ?? `HTTP ${response.status}`);
  }

  return body as TBody;
}
