import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFallbackPreparationItems } from '../server/fallbackPreparationRepository.ts';
import { createPreparationSummary } from '../server/preparationSummary.ts';

test('createPreparationSummary returns the seed summary 8 / 3 / 5 / 38', async () => {
  const items = await readFallbackPreparationItems();

  assert.deepStrictEqual(createPreparationSummary(items), {
    total: 8,
    completed: 3,
    remaining: 5,
    percentage: 38,
  });
});

test('createPreparationSummary returns zeros for an empty list', () => {
  assert.deepStrictEqual(createPreparationSummary([]), {
    total: 0,
    completed: 0,
    remaining: 0,
    percentage: 0,
  });
});
