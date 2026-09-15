import type { PreparationItem, PreparationSummary } from './contracts.ts';

export function createPreparationSummary(items: readonly PreparationItem[]): PreparationSummary {
  const total = items.length;
  const completed = items.reduce((count, item) => count + (item.completed === true ? 1 : 0), 0);

  return {
    total,
    completed,
    remaining: total - completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}
