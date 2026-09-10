import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isRedisConfigured, readRedisRuntimeConfig } from '../server/config.ts';

test('readRedisRuntimeConfig accepts a complete HTTPS configuration', () => {
  const config = readRedisRuntimeConfig({
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io/',
    UPSTASH_REDIS_REST_TOKEN: 'read-only-example-token',
    UPSTASH_PREPARATION_KEY: 'week2:items'
  });

  assert.deepEqual(config, {
    url: 'https://example.upstash.io',
    token: 'read-only-example-token',
    key: 'week2:items'
  });
});

test('readRedisRuntimeConfig rejects missing and placeholder secrets', () => {
  assert.throws(() => readRedisRuntimeConfig({}), /UPSTASH_REDIS_REST_URL/);
  assert.throws(() => readRedisRuntimeConfig({
    UPSTASH_REDIS_REST_URL: 'https://YOUR-DATABASE.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'YOUR_READ_ONLY_TOKEN'
  }), /placeholder/);
  assert.equal(isRedisConfigured({}), false);
});
