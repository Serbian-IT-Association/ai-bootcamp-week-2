import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectPreparationItems } from '../server/itemSelection.ts';

const items = [
  { id: 1, title: 'Prvi korak', completed: true },
  { id: 2, title: 'Drugi korak', completed: false }
];

test('selectPreparationItems filters completed values', () => {
  const selection = selectPreparationItems(items, '/api/preparation-items?completed=true');
  assert.equal(selection.kind, 'list');
  if (selection.kind === 'list') assert.deepEqual(selection.items.map((item) => item.id), [1]);
});

test('selectPreparationItems selects detail and rejects invalid input', () => {
  const selection = selectPreparationItems(items, '/api/preparation-items?id=2');
  assert.equal(selection.kind, 'detail');
  if (selection.kind === 'detail') assert.equal(selection.item?.title, 'Drugi korak');

  assert.throws(
    () => selectPreparationItems(items, '/api/preparation-items?completed=maybe'),
    /true ili false/
  );
});
