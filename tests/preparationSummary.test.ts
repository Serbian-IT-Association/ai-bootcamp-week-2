import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPreparationSummary } from '../server/preparationSummary.ts';
import type { PreparationItem } from '../server/contracts.ts';

function item(id: number, completed: boolean): PreparationItem {
  return { id, title: `Item ${id}`, completed };
}

test('osam stavki, tri završene → 8 / 3 / 5 / 38', function () {
  const items = [
    item(1, true), item(2, true), item(3, true),
    item(4, false), item(5, false), item(6, false),
    item(7, false), item(8, false),
  ];

  assert.deepEqual(createPreparationSummary(items), {
    total: 8, completed: 3, remaining: 5, percentage: 38,
  });
});

test('prazan niz → sve nule', function () {
  assert.deepEqual(createPreparationSummary([]), {
    total: 0, completed: 0, remaining: 0, percentage: 0,
  });
});
