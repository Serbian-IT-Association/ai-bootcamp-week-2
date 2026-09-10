import type { IncomingMessage, ServerResponse } from 'node:http';
import { requireGet, sendJson, sendKnownError } from '../server/http.ts';
import { selectPreparationItems } from '../server/itemSelection.ts';
import { loadPreparationItems } from '../server/preparationService.ts';

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (!requireGet(request, response)) return;

  try {
    const items = await loadPreparationItems();
    const selection = selectPreparationItems(items, request.url ?? '/api/preparation-items');

    if (selection.kind === 'detail') {
      if (!selection.item) {
        sendJson(response, 404, {
          error: {
            code: 'PREPARATION_ITEM_NOT_FOUND',
            message: 'Tražena stavka pripreme ne postoji.'
          }
        });
        return;
      }

      sendJson(response, 200, { data: { item: selection.item } });
      return;
    }

    sendJson(response, 200, { data: { items: selection.items } });
  } catch (error) {
    sendKnownError(response, error);
  }
}
