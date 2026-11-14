import path from 'path';
import fs from 'fs';

type LockfilePackage = { version?: string };
type Lockfile = { packages: Record<string, LockfilePackage> };

const PATCHED_MINIMUM_BY_MAJOR: ReadonlyArray<{
  major: number;
  minimum: string;
}> = [
  { major: 5, minimum: '5.0.11' },
  { major: 2, minimum: '2.1.6' },
  { major: 1, minimum: '1.1.20' },
];

const parseVersion = (version: string): number[] =>
  version.split('.').map((part) => parseInt(part, 10));

const isAtLeast = (version: string, minimum: string): boolean => {
  const actual = parseVersion(version);
  const required = parseVersion(minimum);
  for (let index = 0; index < 3; index++) {
    if (actual[index] !== required[index]) {
      return actual[index] > required[index];
    }
  }
  return true;
};

describe('brace-expansion dependency versions in package-lock.json', () => {
  test('every brace-expansion instance is at or above the patched minimum for its major version', () => {
    const lockfile: Lockfile = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package-lock.json'), 'utf8'),
    );
    const instances = Object.entries(lockfile.packages)
      .filter(([pkgPath]) => pkgPath.endsWith('node_modules/brace-expansion'))
      .map(([pkgPath, pkg]) => ({ pkgPath, version: pkg.version ?? '' }));

    expect(instances.length).toBeGreaterThan(0);

    const violations = instances
      .filter(({ version }) => {
        const major = parseVersion(version)[0];
        const rule = PATCHED_MINIMUM_BY_MAJOR.find(
          (candidate) => candidate.major === major,
        );
        return rule === undefined || !isAtLeast(version, rule.minimum);
      })
      .map(({ pkgPath, version }) => ({ pkgPath, version }));

    expect(violations).toEqual([]);
  });
});
