import { spawnSync } from 'child_process';
import path from 'path';

const SCRIPT = path.join(__dirname, 'enable-auto-merge-error-handler.sh');

const runScript = (
  input: string,
): { exitCode: number | null; stdout: string } => {
  const result = spawnSync('bash', [SCRIPT], { input, encoding: 'utf8' });
  return { exitCode: result.status, stdout: result.stdout };
};

describe('enable-auto-merge-error-handler.sh', () => {
  it('exits 0 for success response with no errors key', () => {
    const { exitCode } = runScript(
      '{"data":{"enablePullRequestAutoMerge":{"clientMutationId":null}}}',
    );
    expect(exitCode).toBe(0);
  });

  it('exits 0 for RATE_LIMIT error type', () => {
    const { exitCode } = runScript(
      '{"errors":[{"type":"RATE_LIMIT","message":"API rate limit exceeded"}]}',
    );
    expect(exitCode).toBe(0);
  });

  it('exits 0 for unstable message pattern', () => {
    const { exitCode } = runScript(
      '{"errors":[{"type":"UNPROCESSABLE","message":"Pull request is in unstable state"}]}',
    );
    expect(exitCode).toBe(0);
  });

  it('exits 0 for already auto merge message pattern', () => {
    const { exitCode } = runScript(
      '{"errors":[{"type":"UNPROCESSABLE","message":"already set to auto merge"}]}',
    );
    expect(exitCode).toBe(0);
  });

  it('exits 1 for generic error', () => {
    const { exitCode } = runScript(
      '{"errors":[{"type":"ERROR","message":"Something went wrong"}]}',
    );
    expect(exitCode).toBe(1);
  });
});
