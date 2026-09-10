const baseUrl = (process.env.BASE_URL ?? 'http://127.0.0.1:4173').replace(/\/+$/, '');
const expectedSummaryStatus = Number(process.env.EXPECT_SUMMARY_STATUS ?? 200);
const checks = [
  ['page loads', '/', 200, (body) => body.includes('Priprema za intervju') && body.includes('/assets/main.js')],
  ['compiled client loads', '/assets/main.js', 200, (body) => body.includes('InterviewPreparationPage')],
  ['health is safe', '/api/health', 200, (body) => body.data?.status === 'ok' && !JSON.stringify(body).includes('UPSTASH_REDIS_REST_TOKEN')],
  ['all seed items load', '/api/preparation-items', 200, (body) => body.data?.items?.length === 8],
  ['completed filter works', '/api/preparation-items?completed=true', 200, (body) => body.data?.items?.length === 3],
  ['open filter works', '/api/preparation-items?completed=false', 200, (body) => body.data?.items?.length === 5],
  ['item detail works', '/api/preparation-items?id=2', 200, (body) => body.data?.item?.id === 2],
  ['missing item is explicit', '/api/preparation-items?id=999', 404, (body) => body.error?.code === 'PREPARATION_ITEM_NOT_FOUND'],
  ['bad filter is rejected', '/api/preparation-items?completed=maybe', 400, (body) => body.error?.code === 'INVALID_REQUEST'],
  ['summary contract', '/api/preparation-summary', expectedSummaryStatus, validateSummary],
  ['missing static file', '/missing-file.txt', 404, (body) => typeof body === 'string']
];

console.log(`Smoke target: ${baseUrl}`);
let failures = 0;

for (const [name, path, expectedStatus, validate] of checks) {
  try {
    const response = await fetch(`${baseUrl}${path}`);
    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json') ? await response.json() : await response.text();
    assert(response.status === expectedStatus, `expected ${expectedStatus}, got ${response.status}`);
    assert(validate(body), 'response body did not match the expected contract');
    console.log(`PASS  ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Smoke failed: ${failures}/${checks.length} checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`Smoke passed: ${checks.length}/${checks.length} checks passed.`);
}

function validateSummary(body) {
  if (expectedSummaryStatus === 501) return body.error?.code === 'SUMMARY_NOT_IMPLEMENTED';
  return body.data?.total === 8
    && body.data?.completed === 3
    && body.data?.remaining === 5
    && body.data?.percentage === 38;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
