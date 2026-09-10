import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredFiles = ['index.html', 'styles.css', 'sita-favicon.webp', 'assets/apiClient.js', 'assets/main.js'];
const forbiddenSegments = new Set(['api', 'server', 'tests', '.git', '.vercel', 'node_modules']);
const forbiddenFileNames = new Set(['.env', '.DS_Store']);
const forbiddenExtensions = new Set(['.ts', '.map']);
const forbiddenText = ['UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_REDIS_REST_URL', 'Authorization: Bearer'];
const distDirectoryPath = fileURLToPath(new URL('../dist', import.meta.url));
const files = await listFiles(distDirectoryPath);
const relativeFiles = files.map((filePath) => relative(distDirectoryPath, filePath).split(sep).join('/')).sort();

for (const requiredFile of requiredFiles) {
  if (!relativeFiles.includes(requiredFile)) {
    throw new Error(`dist inventory missing required file: ${requiredFile}`);
  }
}

for (const [index, relativeFile] of relativeFiles.entries()) {
  const filePath = files[index];
  const segments = relativeFile.split('/');
  const fileName = segments.at(-1) ?? relativeFile;

  if (segments.some((segment) => forbiddenSegments.has(segment))) {
    throw new Error(`dist inventory contains forbidden directory: ${relativeFile}`);
  }

  if (forbiddenFileNames.has(fileName) || [...forbiddenExtensions].some((extension) => relativeFile.endsWith(extension))) {
    throw new Error(`dist inventory contains forbidden file: ${relativeFile}`);
  }

  const content = await readFile(filePath, 'utf8');
  const leakedMarker = forbiddenText.find((marker) => content.includes(marker));
  if (leakedMarker) {
    throw new Error(`dist contains server-only marker '${leakedMarker}' in ${relativeFile}`);
  }
}

console.log('dist inventory ok:');
for (const relativeFile of relativeFiles) console.log(`- ${relativeFile}`);

async function listFiles(directoryPath) {
  const entries = await readdir(directoryPath);
  const result = [];

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry);
    const entryStat = await stat(entryPath);
    if (entryStat.isDirectory()) result.push(...await listFiles(entryPath));
    else result.push(entryPath);
  }

  return result.sort();
}
