import { access, copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const staticFileNames = ['index.html', 'styles.css', 'sita-favicon.webp'];
const publicDirectoryPath = fileURLToPath(new URL('../public', import.meta.url));
const distDirectoryPath = fileURLToPath(new URL('../dist', import.meta.url));

await mkdir(distDirectoryPath, { recursive: true });

for (const fileName of staticFileNames) {
  const sourcePath = join(publicDirectoryPath, fileName);
  await access(sourcePath);
  await copyFile(sourcePath, join(distDirectoryPath, fileName));
}
