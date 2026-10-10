import packageJson from './package.json';

describe('production dependency surface', () => {
  test('@semantic-release/npm is not a production dependency', () => {
    expect(Object.keys(packageJson.dependencies)).not.toContain(
      '@semantic-release/npm',
    );
  });

  test('@semantic-release/npm remains available as a devDependency for the release workflow', () => {
    expect(Object.keys(packageJson.devDependencies)).toContain(
      '@semantic-release/npm',
    );
  });
});
