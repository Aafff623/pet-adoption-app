import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const action = process.argv[2];
const scriptMap = {
  sync: 'sync-ai',
  bootstrap: 'bootstrap',
  doctor: 'doctor'
};

if (!action || !(action in scriptMap)) {
  console.error('Usage: node scripts/run-workflow.mjs <sync|bootstrap|doctor>');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const scriptBaseName = scriptMap[action];
const scriptPath = path.join(__dirname, `${scriptBaseName}.${isWindows ? 'ps1' : 'sh'}`);

const command = isWindows ? 'powershell' : 'bash';
const args = isWindows
  ? ['-ExecutionPolicy', 'Bypass', '-File', scriptPath]
  : [scriptPath];

const result = spawnSync(command, args, { stdio: 'inherit' });

if (typeof result.status === 'number') {
  process.exit(result.status);
}

if (result.error) {
  console.error(result.error.message);
}

process.exit(1);
