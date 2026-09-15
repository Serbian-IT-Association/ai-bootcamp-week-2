import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPreparationSummary } from '../server/preparationSummary.ts';

const seedItems = [
  { id: 1, title: 'Pročitaj opis pozicije', completed: true },
  { id: 2, title: 'Izdvoji tri najvažnije tehnologije', completed: true },
  { id: 3, title: 'Pripremi STAR primer za timski rad', completed: false },
  { id: 4, title: 'Pripremi primer debugovanja', completed: false },
  { id: 5, title: 'Proveri GitHub profil', completed: true },
  { id: 6, title: 'Zapiši pitanja za intervjuera', completed: false },
  { id: 7, title: 'Proveri lokalno pokretanje projekta', completed: false },
  { id: 8, title: 'Napravi kratak plan učenja', completed: false }
];

test('createPreparationSummary computes totals for the seed result', () => {
  const summary = createPreparationSummary(seedItems);
  assert.deepEqual(summary, { total: 8, completed: 3, remaining: 5, percentage: 38 });
});

test('createPreparationSummary returns zeros for an empty array', () => {
  const summary = createPreparationSummary([]);
  assert.deepEqual(summary, { total: 0, completed: 0, remaining: 0, percentage: 0 });
});

test('createPreparationSummary reports full completion', () => {
  const items = [
    { id: 1, title: 'a', completed: true },
    { id: 2, title: 'b', completed: true }
  ];
  assert.deepEqual(createPreparationSummary(items), { total: 2, completed: 2, remaining: 0, percentage: 100 });
});

test('createPreparationSummary reports zero completion', () => {
  const items = [
    { id: 1, title: 'a', completed: false },
    { id: 2, title: 'b', completed: false }
  ];
  assert.deepEqual(createPreparationSummary(items), { total: 2, completed: 0, remaining: 2, percentage: 0 });
});

test('createPreparationSummary rounds down below the midpoint', () => {
  const items = [
    { id: 1, title: 'a', completed: true },
    { id: 2, title: 'b', completed: false },
    { id: 3, title: 'c', completed: false }
  ];
  assert.equal(createPreparationSummary(items).percentage, 33);
});

test('createPreparationSummary rounds up at the midpoint', () => {
  const items = [
    { id: 1, title: 'a', completed: true },
    { id: 2, title: 'b', completed: true },
    { id: 3, title: 'c', completed: false }
  ];
  assert.equal(createPreparationSummary(items).percentage, 67);
});
