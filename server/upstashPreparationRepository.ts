import type { PreparationItem } from './contracts.ts';
import type { RedisRuntimeConfig } from './config.ts';
import { DataContractError, ExternalServiceError } from './errors.ts';
import { parsePreparationItems } from './preparationData.ts';

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type UpstashGetResponse = Readonly<{
  result?: unknown;
}>;

export async function readPreparationItemsFromUpstash(
  config: RedisRuntimeConfig,
  fetchImplementation: FetchLike = fetch
): Promise<PreparationItem[]> {
  let response: Response;

  try {
    response = await fetchImplementation(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', config.key])
    });
  } catch {
    throw new ExternalServiceError('Upstash servis nije dostupan.');
  }

  if (!response.ok) {
    throw new ExternalServiceError(`Upstash je vratio HTTP status ${response.status}.`);
  }

  let envelope: UpstashGetResponse;
  try {
    envelope = await response.json() as UpstashGetResponse;
  } catch {
    throw new DataContractError('Upstash odgovor nije ispravan JSON.');
  }

  if (envelope.result === null || envelope.result === undefined) {
    throw new DataContractError('Upstash seed ključ ne postoji ili nema vrednost.');
  }

  if (typeof envelope.result !== 'string') {
    throw new DataContractError('Upstash GET rezultat mora biti JSON string.');
  }

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(envelope.result);
  } catch {
    throw new DataContractError('Upstash seed vrednost nije validan JSON string.');
  }

  return parsePreparationItems(parsedValue);
}
