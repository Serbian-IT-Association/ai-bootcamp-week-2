import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createPreparationSummary } from '../server/preparationSummary.ts';

const seedItems = [
  { id: 1, title: '1', completed: true },
  { id: 2, title: '2', completed: true },
  { id: 3, title: '3', completed: false },
  { id: 4, title: '4', completed: false },
  { id: 5, title: '5', completed: true },
  { id: 6, title: '6', completed: false },
  { id: 7, title: '7', completed: false },
  { id: 8, title: '8', completed: false }
];

assert.deepEqual(createPreparationSummary(seedItems), {
  total: 8,
  completed: 3,
  remaining: 5,
  percentage: 38
});
assert.deepEqual(createPreparationSummary([]), {
  total: 0,
  completed: 0,
  remaining: 0,
  percentage: 0
});

const summaryTestSource = await readProjectFile('../tests/preparationSummary.test.ts');
assert.doesNotMatch(summaryTestSource, /\btest\.todo\b/, 'Summary test still contains test.todo.');

const apiClientSource = await readProjectFile('../client/apiClient.ts');
assert.match(apiClientSource, /['"]\/api\/preparation-summary['"]/, 'Browser summary route is not connected to the expected endpoint.');
assert.doesNotMatch(apiClientSource, /['"]\/api\/preparation-summaries['"]/, 'Browser summary route still contains the controlled path error.');

const vercelConfig = JSON.parse(await readProjectFile('../vercel.json'));
assert.equal(vercelConfig.outputDirectory, 'dist', 'Vercel outputDirectory must point to the verified browser build.');

console.log('solution contract ok: summary, tests, browser route and Vercel output');

function readProjectFile(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}
