import { ServiceConfigurationError } from './errors.ts';

export type PublicRuntimeConfig = Readonly<{
  environment: string;
  message: string;
}>;

export type RedisRuntimeConfig = Readonly<{
  url: string;
  token: string;
  key: string;
}>;

const PLACEHOLDER_PARTS = ['YOUR-DATABASE', 'YOUR_READ_ONLY_TOKEN'];

export function readPublicRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): PublicRuntimeConfig {
  return {
    environment: readOptionalValue(environment.APP_ENV, 'local'),
    message: readOptionalValue(environment.APP_MESSAGE, 'Week 2 okruženje')
  };
}

export function isRedisConfigured(environment: NodeJS.ProcessEnv = process.env): boolean {
  try {
    readRedisRuntimeConfig(environment);
    return true;
  } catch {
    return false;
  }
}

export function readRedisRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): RedisRuntimeConfig {
  const url = readRequiredValue(environment.UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_URL');
  const token = readRequiredValue(environment.UPSTASH_REDIS_REST_TOKEN, 'UPSTASH_REDIS_REST_TOKEN');
  const key = readOptionalValue(environment.UPSTASH_PREPARATION_KEY, 'week2:preparation-items');

  if (PLACEHOLDER_PARTS.some((placeholder) => url.includes(placeholder) || token.includes(placeholder))) {
    throw new ServiceConfigurationError('Upstash konfiguracija i dalje sadrži placeholder vrednost.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ServiceConfigurationError('UPSTASH_REDIS_REST_URL nije ispravan URL.');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new ServiceConfigurationError('UPSTASH_REDIS_REST_URL mora koristiti HTTPS.');
  }

  return {
    url: parsedUrl.toString().replace(/\/+$/, ''),
    token,
    key
  };
}

function readRequiredValue(value: string | undefined, name: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new ServiceConfigurationError(`Nedostaje obavezna environment variable: ${name}.`);
  }

  return normalized;
}

function readOptionalValue(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}
