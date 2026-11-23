import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(here, '..');
const envFile = path.join(apiDir, '.env');
const name = 'fixora-api';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function docker(args, allowFail = false) {
  const result = spawnSync('docker', args, { cwd: apiDir, encoding: 'utf8' });
  if (result.status !== 0) {
    if (allowFail) return null;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    return null;
  }
  return result.stdout.trim();
}

async function ensureContainer() {
  let exists;
  let retries = 0;

  while (exists === null && retries < 5) {
    exists = docker(['ps', '-a', '--filter', `name=^/${name}$`, '--format', '{{.Names}}'], true);
    if (exists === null) {
      retries += 1;
      console.log('Docker is not ready yet — retrying...');
      await wait(2000);
    }
  }

  if (exists === null) return false;

  if (!exists) {
    docker([
      'run', '-d',
      '--name', name,
      '-p', '8123:8123',
      '--env-file', envFile,
      '-e', 'PORT=8123',
      'fixora-api:local',
    ]);
    console.log('Created and started the Fixora backend container.');
    return true;
  }

  const running = docker(['ps', '--filter', `name=^/${name}$`, '--format', '{{.Names}}'], true);
  if (running === null) return false;

  if (!running) {
    docker(['start', name]);
    console.log('Started the existing Fixora backend container.');
  }

  return true;
}

async function followLogs() {
  let announced = false;

  while (true) {
    if (!(await ensureContainer())) {
      await wait(5000);
      continue;
    }

    if (!announced) {
      console.log('Backend API: http://127.0.0.1:8123');
      announced = true;
    }

    await new Promise((resolve) => {
      const logs = spawn('docker', ['logs', '-f', name], { stdio: 'inherit' });
      logs.once('exit', resolve);
      logs.once('error', resolve);
    });

    console.log('Backend log stream ended — reconnecting...');
    await wait(2000);
  }
}

followLogs();
