import type { IncomingMessage, ServerResponse } from 'node:http';
import { isRedisConfigured, readPublicRuntimeConfig } from '../server/config.ts';
import type { HealthData } from '../server/contracts.ts';
import { requireGet, sendJson } from '../server/http.ts';

export default function handler(request: IncomingMessage, response: ServerResponse): void {
  if (!requireGet(request, response)) return;

  const publicConfig = readPublicRuntimeConfig();
  const data: HealthData = {
    status: 'ok',
    environment: publicConfig.environment,
    message: publicConfig.message,
    preparationServiceConfigured: process.env.PREPARATION_DATA_MODE === 'fallback' || isRedisConfigured()
  };

  sendJson(response, 200, { data });
}
