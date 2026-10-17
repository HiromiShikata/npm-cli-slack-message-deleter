import path from 'path';
import fs from 'fs';

describe('undici TLS certificate validation bypass dependency version', () => {
  test('undici nested under @semantic-release/github is >= 7.29.1', () => {
    const mainPath = require.resolve('@semantic-release/github');
    const pkgDir = path.dirname(mainPath);
    const undiciPkgPath = path.join(
      pkgDir,
      'node_modules',
      'undici',
      'package.json',
    );
    const installedVersion: string = JSON.parse(
      fs.readFileSync(undiciPkgPath, 'utf8'),
    ).version;
    const [major, minor, patch] = installedVersion
      .split('.')
      .map((part) => parseInt(part, 10));

    const isAtLeastPatchedVersion =
      major > 7 ||
      (major === 7 && minor > 29) ||
      (major === 7 && minor === 29 && patch >= 1);

    expect(isAtLeastPatchedVersion).toBe(true);
  });
});
