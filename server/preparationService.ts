import type { PreparationItem } from './contracts.ts';
import { readRedisRuntimeConfig } from './config.ts';
import { readFallbackPreparationItems } from './fallbackPreparationRepository.ts';
import { readPreparationItemsFromUpstash, type FetchLike } from './upstashPreparationRepository.ts';

export async function loadPreparationItems(
  environment: NodeJS.ProcessEnv = process.env,
  fetchImplementation: FetchLike = fetch
): Promise<PreparationItem[]> {
  if (environment.PREPARATION_DATA_MODE === 'fallback') {
    return readFallbackPreparationItems();
  }

  const config = readRedisRuntimeConfig(environment);
  return readPreparationItemsFromUpstash(config, fetchImplementation);
}
