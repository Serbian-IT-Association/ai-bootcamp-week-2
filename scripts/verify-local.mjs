import { spawn } from 'node:child_process';

const port = '4174';
const baseUrl = `http://127.0.0.1:${port}`;
const expectedSummaryStatus = readSummaryStatus(process.argv.slice(2));
const server = spawn(process.execPath, ['scripts/serve.mjs'], {
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: port,
    APP_ENV: 'fallback-verification',
    APP_MESSAGE: 'Lokalna rezervna putanja za probno izvođenje',
    PREPARATION_DATA_MODE: 'fallback'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

try {
  await waitForServer(`${baseUrl}/api/health`);
  const smoke = spawn(process.execPath, ['scripts/smoke.mjs'], {
    env: { ...process.env, BASE_URL: baseUrl, EXPECT_SUMMARY_STATUS: String(expectedSummaryStatus) },
    stdio: 'inherit'
  });
  const exitCode = await waitForExit(smoke);
  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  server.kill('SIGTERM');
  await waitForExit(server);
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The child process may still be starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Local server did not become ready at ${url}.`);
}

function waitForExit(childProcess) {
  return new Promise((resolve) => {
    if (childProcess.exitCode !== null) {
      resolve(childProcess.exitCode);
      return;
    }

    childProcess.once('exit', (code) => resolve(code ?? 1));
  });
}

function readSummaryStatus(argumentsList) {
  const prefix = '--summary-status=';
  const argument = argumentsList.find((value) => value.startsWith(prefix));
  const status = Number(argument?.slice(prefix.length) ?? 501);

  if (!Number.isInteger(status) || status < 100 || status > 599) {
    throw new Error('Expected --summary-status to contain a valid HTTP status.');
  }

  return status;
}
