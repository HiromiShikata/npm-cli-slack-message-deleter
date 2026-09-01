import { spawnSync } from 'child_process';
import path from 'path';

const SCRIPT = path.join(__dirname, 'enable-auto-merge-error-handler.sh');

const runScript = (input: string): number | null => {
  const result = spawnSync('bash', [SCRIPT], { input, encoding: 'utf8' });
  return result.status;
};

describe('enable-auto-merge-error-handler.sh', () => {
  it('exits 0 for success response with no errors key', () => {
    const exitCode = runScript(
      '{"data":{"enablePullRequestAutoMerge":{"clientMutationId":null}}}',
    );
    expect(exitCode).toBe(0);
  });

  it('exits 0 for RATE_LIMIT error type', () => {
    expect(
      runScript(
        '{"errors":[{"type":"RATE_LIMIT","message":"API rate limit exceeded"}]}',
      ),
    ).toBe(0);
  });

  it('exits 0 for unstable message pattern', () => {
    expect(
      runScript(
        '{"errors":[{"type":"UNPROCESSABLE","message":"Pull request is in unstable state"}]}',
      ),
    ).toBe(0);
  });

  it('exits 0 for already auto merge message pattern', () => {
    expect(
      runScript(
        '{"errors":[{"type":"UNPROCESSABLE","message":"already set to auto merge"}]}',
      ),
    ).toBe(0);
  });

  it('exits 1 for generic error', () => {
    expect(
      runScript(
        '{"errors":[{"type":"ERROR","message":"Something went wrong"}]}',
      ),
    ).toBe(1);
  });
});
