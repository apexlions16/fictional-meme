import { mkdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const arch = process.argv[2] ?? 'amd64';
const supported = new Set(['amd64', 'arm64']);
if (!supported.has(arch)) throw new Error(`Unsupported Windows architecture: ${arch}`);

const releaseDir = resolve(root, 'release');
await mkdir(releaseDir, { recursive: true });
const output = resolve(releaseDir, `Fictional-Meme-v${pkg.version}-windows-${arch === 'amd64' ? 'x64' : 'arm64'}.exe`);

const args = [
  'build',
  '-trimpath',
  '-ldflags',
  `-H=windowsgui -s -w -X main.version=${pkg.version}`,
  '-o',
  output,
  '.',
];

await new Promise((resolvePromise, reject) => {
  const child = spawn('go', args, {
    cwd: resolve(root, 'desktop'),
    stdio: 'inherit',
    env: { ...process.env, GOOS: 'windows', GOARCH: arch, CGO_ENABLED: '0' },
  });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error(`go build exited with code ${code}`)));
});

console.log(`Created ${output}`);
