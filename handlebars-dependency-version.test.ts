describe('handlebars dependency version', () => {
  test('installed handlebars version is >= 4.7.10', () => {
    const installedVersion: string = require('handlebars/package.json').version;
    const [major, minor, patch] = installedVersion
      .split('.')
      .map((part) => parseInt(part, 10));

    const isAtLeastPatchedVersion =
      major > 4 ||
      (major === 4 && minor > 7) ||
      (major === 4 && minor === 7 && patch >= 10);

    expect(isAtLeastPatchedVersion).toBe(true);
  });
});
