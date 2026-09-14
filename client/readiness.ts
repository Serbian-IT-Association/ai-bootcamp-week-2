export type ReadinessLevel = 'Zagrevanje' | 'Na dobrom putu' | 'Spremno za intervju';

export function getReadinessLevel(percentage: number): ReadinessLevel {
  if (percentage < 40) return 'Zagrevanje';
  if (percentage < 75) return 'Na dobrom putu';
  return 'Spremno za intervju';
}
