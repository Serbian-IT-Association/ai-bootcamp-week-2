import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPreparationSummary } from '../server/preparationSummary.ts';

test('creates the summary for the seed items', () => {
  const items = [
    { id: 1, title: '1', completed: true },
    { id: 2, title: '2', completed: true },
    { id: 3, title: '3', completed: false },
    { id: 4, title: '4', completed: false },
    { id: 5, title: '5', completed: true },
    { id: 6, title: '6', completed: false },
    { id: 7, title: '7', completed: false },
    { id: 8, title: '8', completed: false }
  ];

  assert.deepEqual(createPreparationSummary(items), {
    total: 8,
    completed: 3,
    remaining: 5,
    percentage: 38
  });
});

test('creates an empty summary for no items', () => {
  assert.deepEqual(createPreparationSummary([]), {
    total: 0,
    completed: 0,
    remaining: 0,
    percentage: 0
  });
});
