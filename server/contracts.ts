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
