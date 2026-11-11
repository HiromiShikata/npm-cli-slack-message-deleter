import path from 'path';
import fs from 'fs';

const findNodeModulesPackageDir = (startDir: string, name: string): string => {
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

const resolveUndiciVersionFrom = (parentPackageName: string): string => {
  const parentDir = findNodeModulesPackageDir(
    path.resolve(__dirname),
    parentPackageName,
  );
  return readInstalledVersion(findNodeModulesPackageDir(parentDir, 'undici'));
};

const isAtLeast = (
  installedVersion: string,
  minimumVersion: string,
): boolean => {
  const toParts = (version: string): number[] =>
    version.split('.').map((part) => parseInt(part, 10));
  const installed = toParts(installedVersion);
  const minimum = toParts(minimumVersion);
  for (let partIndex = 0; partIndex < minimum.length; partIndex++) {
    if (installed[partIndex] !== minimum[partIndex]) {
      return installed[partIndex] > minimum[partIndex];
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

  test('undici bundled inside npm is >= 6.29.1', () => {
    const installedVersion = resolveUndiciVersionFrom('npm');

    expect(isAtLeast(installedVersion, '6.29.1')).toBe(true);
  });
});
