import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readPreparationItemsFromUpstash, type FetchLike } from '../server/upstashPreparationRepository.ts';

const config = {
  url: 'https://example.upstash.io',
  token: 'read-only-test-token',
  key: 'week2:preparation-items'
};

test('readPreparationItemsFromUpstash sends a read-only GET command and parses the seed', async () => {
  let capturedAuthorization = '';
  let capturedBody = '';
  const fakeFetch: FetchLike = async (_input, init) => {
    const headers = new Headers(init?.headers);
    capturedAuthorization = headers.get('Authorization') ?? '';
    capturedBody = String(init?.body ?? '');
    return Response.json({
      result: JSON.stringify([{ id: 1, title: 'Prvi korak', completed: true }])
    });
  };

  const items = await readPreparationItemsFromUpstash(config, fakeFetch);

  assert.equal(capturedAuthorization, 'Bearer read-only-test-token');
  assert.deepEqual(JSON.parse(capturedBody), ['GET', 'week2:preparation-items']);
  assert.equal(items[0]?.completed, true);
});

test('readPreparationItemsFromUpstash maps an upstream failure without exposing the token', async () => {
  const fakeFetch: FetchLike = async () => new Response('unauthorized', { status: 401 });

  await assert.rejects(
    () => readPreparationItemsFromUpstash(config, fakeFetch),
    (error: unknown) => error instanceof Error
      && /HTTP status 401/.test(error.message)
      && !error.message.includes(config.token)
  );
});
