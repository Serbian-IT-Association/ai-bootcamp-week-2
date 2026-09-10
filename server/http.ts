import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  DataContractError,
  ExternalServiceError,
  RequestValidationError,
  ServiceConfigurationError,
  SummaryNotImplementedError
} from './errors.ts';

type JsonRecord = Record<string, unknown>;

export function requireGet(request: IncomingMessage, response: ServerResponse): boolean {
  if (request.method === 'GET') {
    return true;
  }

  response.setHeader('Allow', 'GET');
  sendJson(response, 405, {
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Dozvoljen je samo GET zahtev.'
    }
  });
  return false;
}

export function sendJson(response: ServerResponse, status: number, body: JsonRecord): void {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

export function sendKnownError(response: ServerResponse, error: unknown): void {
  if (error instanceof SummaryNotImplementedError) {
    sendJson(response, 501, {
      error: {
        code: 'SUMMARY_NOT_IMPLEMENTED',
        message: 'Pregled pripreme je Week 2 zadatak i još nije implementiran.'
      }
    });
    return;
  }

  if (error instanceof RequestValidationError) {
    sendJson(response, 400, { error: { code: 'INVALID_REQUEST', message: error.message } });
    return;
  }

  if (error instanceof ServiceConfigurationError) {
    sendJson(response, 503, {
      error: {
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Servisna konfiguracija nedostaje ili nije ispravna.'
      }
    });
    return;
  }

  if (error instanceof ExternalServiceError || error instanceof DataContractError) {
    sendJson(response, 502, {
      error: {
        code: 'PREPARATION_SERVICE_ERROR',
        message: 'Podaci za pripremu trenutno nisu dostupni.'
      }
    });
    return;
  }

  console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Unexpected server error');
  sendJson(response, 500, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Došlo je do neočekivane serverske greške.'
    }
  });
}
