import { deepStrictEqual } from 'node:assert/strict';
import { test } from 'node:test';
import { createPreparationSummary } from '../server/preparationSummary.ts';

test('računa summary za osam seed stavki sa tri završene', () => {
  const items = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    title: `Stavka ${index + 1}`,
    completed: index < 3
  }));

  deepStrictEqual(createPreparationSummary(items), {
    total: 8,
    completed: 3,
    remaining: 5,
    percentage: 38
  });
});

test('vraća nule za prazan niz', () => {
  deepStrictEqual(createPreparationSummary([]), {
    total: 0,
    completed: 0,
    remaining: 0,
    percentage: 0
  });
});
