import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFallbackPreparationItems } from '../server/fallbackPreparationRepository.ts';
import { createPreparationSummary } from '../server/preparationSummary.ts';

test('createPreparationSummary returns the seed summary with a rounded percentage', async () => {
  const items = await readFallbackPreparationItems();

  assert.deepEqual(createPreparationSummary(items), {
    total: 8,
    completed: 3,
    remaining: 5,
    percentage: 38
  });
});

test('createPreparationSummary returns zeros for an empty array', () => {
  assert.deepEqual(createPreparationSummary([]), {
    total: 0,
    completed: 0,
    remaining: 0,
    percentage: 0
  });
});

test('createPreparationSummary rounds down when one of three items is completed', () => {
  assert.deepEqual(createPreparationSummary([
    { id: 1, title: 'Prvi korak', completed: true },
    { id: 2, title: 'Drugi korak', completed: false },
    { id: 3, title: 'Treći korak', completed: false }
  ]), { total: 3, completed: 1, remaining: 2, percentage: 33 });
});

test('createPreparationSummary handles all completed and all remaining items', () => {
  assert.deepEqual(createPreparationSummary([
    { id: 1, title: 'Završen korak', completed: true }
  ]), { total: 1, completed: 1, remaining: 0, percentage: 100 });

  assert.deepEqual(createPreparationSummary([
    { id: 1, title: 'Preostao korak', completed: false }
  ]), { total: 1, completed: 0, remaining: 1, percentage: 0 });
});
