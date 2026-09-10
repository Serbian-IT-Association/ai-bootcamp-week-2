import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const distDirectoryPath = fileURLToPath(new URL('../dist', import.meta.url));
await rm(distDirectoryPath, { recursive: true, force: true });
