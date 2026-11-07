import path from 'path';
import fs from 'fs';

// Walks up from `startDir` the way Node does for bare specifiers and returns
// the first `node_modules/<name>` directory. Used instead of require.resolve
// because @actions/http-client is ESM-only and its `exports` map blocks
// require.resolve under Jest.
const findNodeModulesPackageDir = (
  startDir: string,
  name: string,
): string => {
  let dir = startDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(`${name} not found from ${startDir}`);
    }
    dir = parent;
  }
};

const readInstalledVersion = (packageDir: string): string =>
  JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
    .version;

// The undici copy a parent package sees: its own nested node_modules first,
// then the hoisted copy at the repository root.
const resolveUndiciVersionFrom = (parentPackageName: string): string => {
  const parentDir = findNodeModulesPackageDir(
    path.resolve(__dirname),
    parentPackageName,
  );
  return readInstalledVersion(
    findNodeModulesPackageDir(parentDir, 'undici'),
  );
};

const isAtLeast = (installedVersion: string, minimumVersion: string): boolean => {
  const toParts = (version: string): number[] =>
    version.split('.').map((part) => parseInt(part, 10));
  const installed = toParts(installedVersion);
  const minimum = toParts(minimumVersion);
  for (let i = 0; i < minimum.length; i++) {
    if (installed[i] !== minimum[i]) {
      return installed[i] > minimum[i];
    }
  }
  return true;
};

describe('undici patched dependency versions (high Dependabot alerts)', () => {
  test('undici resolved from @semantic-release/github is >= 7.30.1', () => {
    const installedVersion = resolveUndiciVersionFrom(
      '@semantic-release/github',
    );

    expect(isAtLeast(installedVersion, '7.30.1')).toBe(true);
  });

  test('undici resolved from @actions/http-client is >= 6.29.1', () => {
    const installedVersion = resolveUndiciVersionFrom('@actions/http-client');

    expect(isAtLeast(installedVersion, '6.29.1')).toBe(true);
  });
});
