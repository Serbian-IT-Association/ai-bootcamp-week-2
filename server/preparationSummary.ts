import type { PreparationItem, PreparationSummary } from './contracts.ts';
import { SummaryNotImplementedError } from './errors.ts';

export function createPreparationSummary(_items: readonly PreparationItem[]): PreparationSummary {
  // WEEK 2 TASK:
  // 1. Izračunaj total, completed, remaining i percentage iz prosleđenih stavki.
  // 2. Za prazan niz vrati percentage 0.
  // 3. Procenat zaokruži na najbliži ceo broj.
  // 4. Uključi test u tests/preparationSummary.test.ts i zatim ukloni ovo bacanje greške.
  throw new SummaryNotImplementedError();
}
