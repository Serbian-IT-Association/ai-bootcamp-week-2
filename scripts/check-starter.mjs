import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SummaryNotImplementedError } from '../server/errors.ts';
import { createPreparationSummary } from '../server/preparationSummary.ts';

assert.throws(
  () => createPreparationSummary([]),
  SummaryNotImplementedError,
  'Starter summary must remain visibly incomplete before distribution.'
);

const summaryTestSource = await readProjectFile('../tests/preparationSummary.test.ts');
assert.match(summaryTestSource, /\btest\.todo\b/, 'Starter summary test must contain the intentional todo.');

const apiClientSource = await readProjectFile('../client/apiClient.ts');
assert.match(apiClientSource, /['"]\/api\/preparation-summaries['"]/, 'Starter browser path no longer contains the controlled mismatch.');
assert.doesNotMatch(apiClientSource, /['"]\/api\/preparation-summary['"]/, 'Starter browser path already contains the completed route.');

const vercelConfig = JSON.parse(await readProjectFile('../vercel.json'));
assert.equal(vercelConfig.outputDirectory, 'public', 'Starter Vercel output no longer contains the controlled mismatch.');

console.log('starter contract ok: summary todo, browser mismatch and Vercel output mismatch');

function readProjectFile(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}
