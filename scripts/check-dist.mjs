import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
try {
  await execFileAsync('git', ['rev-parse', '--verify', 'HEAD'], {cwd: repositoryRoot});
} catch {
  process.stdout.write('Skipping tracked dist check before the first commit.\n');
  process.exit(0);
}
const {stdout} = await execFileAsync(
  'git',
  ['status', '--short', '--untracked-files=all', '--', 'dist'],
  {cwd: repositoryRoot}
);

if (stdout.length > 0) {
  process.stderr.write('Generated dist files are not up to date:\n');
  process.stderr.write(stdout);
  process.exitCode = 1;
}

// The library entry is plain ESM for hosts that load it without a bundler, such as Node tests in
// the Editor's packages. A relative import without its `.js` extension resolves under a bundler
// but not here, so load it the way such a host does.
try {
  await import(new URL('../dist/lib/composition.js', import.meta.url).href);
} catch (error) {
  process.stderr.write(`dist/lib/composition.js does not load as plain ESM: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
