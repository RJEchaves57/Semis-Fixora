import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webPort = 5180;
const assetPort = 5181;

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(700);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
}

const busy = [];
if (await portOpen(webPort)) busy.push(webPort);
if (await portOpen(assetPort)) busy.push(assetPort);

if (busy.length) {
  console.log(`Fixora is already running on port ${busy.join(' and ')}.`);
  console.log('Open http://localhost:5180 instead of starting a second copy.');
  console.log('To restart: press Ctrl+C in the running terminal, then run npm run dev again.');
  process.exit(0);
}

console.log('Starting Fixora: web + api + assets ...');
console.log('Backend API will run inside Docker and connect to Neon.');

const npmCli = path.join(
  path.dirname(process.execPath),
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js',
);

const child = spawn(process.execPath, [npmCli, 'run', 'dev:raw'], {
  cwd: root,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code) => process.exit(code ?? 0));
