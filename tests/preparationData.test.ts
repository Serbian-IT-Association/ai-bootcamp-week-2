import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePreparationItems } from '../server/preparationData.ts';

test('parsePreparationItems accepts the seed contract', () => {
  const items = parsePreparationItems([
    { id: 1, title: 'Prvi korak', completed: true },
    { id: 2, title: 'Drugi korak', completed: false }
  ]);

  assert.equal(items.length, 2);
  assert.equal(items[0]?.title, 'Prvi korak');
});

test('parsePreparationItems rejects duplicate ids and invalid fields', () => {
  assert.throws(() => parsePreparationItems([
    { id: 1, title: 'Prvi korak', completed: true },
    { id: 1, title: 'Drugi korak', completed: false }
  ]), /jedinstven id/);
  assert.throws(() => parsePreparationItems([{ id: 1, title: '', completed: false }]), /naslov/);
});
