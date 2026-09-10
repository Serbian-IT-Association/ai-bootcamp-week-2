import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { after, before, test } from 'node:test';
import healthHandler from '../api/health.ts';
import preparationItemsHandler from '../api/preparation-items.ts';

const originalMode = process.env.PREPARATION_DATA_MODE;

before(() => {
  process.env.PREPARATION_DATA_MODE = 'fallback';
});

after(() => {
  if (originalMode === undefined) delete process.env.PREPARATION_DATA_MODE;
  else process.env.PREPARATION_DATA_MODE = originalMode;
});

test('starter API handlers expose health and prepared items', async () => {
  const health = await invoke(healthHandler, '/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.data?.preparationServiceConfigured, true);

  const items = await invoke(preparationItemsHandler, '/api/preparation-items?completed=true');
  assert.equal(items.status, 200);
  assert.equal(items.body.data?.items?.length, 3);
});

type Handler = (request: IncomingMessage, response: ServerResponse) => void | Promise<void>;

async function invoke(handler: Handler, url: string): Promise<{ status: number; body: Record<string, any> }> {
  const request = { method: 'GET', url } as IncomingMessage;
  let status = 0;
  let rawBody = '';
  const response = {
    setHeader() {},
    writeHead(nextStatus: number) {
      status = nextStatus;
      return this;
    },
    end(chunk?: string) {
      rawBody = chunk ?? '';
      return this;
    }
  } as unknown as ServerResponse;

  await handler(request, response);
  return { status, body: JSON.parse(rawBody) as Record<string, any> };
}
