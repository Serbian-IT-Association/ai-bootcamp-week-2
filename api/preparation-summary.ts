import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireGet, sendJson, sendKnownError } from '../server/http.ts';
import { loadPreparationItems } from '../server/preparationService.ts';
import { createPreparationSummary } from '../server/preparationSummary.ts';

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!requireGet(request, response)) return;

  try {
    const items = await loadPreparationItems();
    const summary = createPreparationSummary(items);
    sendJson(response, 200, { data: summary });
  } catch (error) {
    sendKnownError(response, error);
  }
}
