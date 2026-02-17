import { execSync } from 'child_process';
import { WebClient } from '@slack/web-api';
import { config } from 'dotenv';

config();

const itIfSlackToken = process.env.SLACK_BOT_TOKEN ? it : it.skip;

describe('commander program', () => {
  jest.setTimeout(120000);
  it('should output help contents', () => {
    const output = execSync(
      'npx ts-node ./src/adapter/entry-points/cli/index.ts -h',
    ).toString();

    expect(output.trim()).toEqual(`Usage: slack-message-deleter [options]

Clean up old messages in slack channel

Options:
  -t, --token <string>    SlackBotToken
  -c, --channel <string>  ChannelId
  -m, --minutes <number>  DeleteMessagesOlderThanThisNumberOfMinutes
  -h, --help              display help for command`);
  });
  itIfSlackToken('should delete message', async () => {
    const token = process.env.SLACK_BOT_TOKEN || '';
    const channel = process.env.SLACK_CHANNEL_ID || 'CFNN90G07';
    const minutes = 1;
    await postMessage(token, channel, 'should be deleted');
    await new Promise((resolve) => setTimeout(resolve, 60000));
    await postMessage(token, channel, 'should be not deleted');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const output = execSync(
      `npx ts-node ./src/adapter/entry-points/cli/index.ts -t ${token} -c ${channel} -m ${minutes}`,
    ).toString();

    expect(output.trim().startsWith('Deleted ')).toEqual(true);
    const web = new WebClient(token);
    const resultMessages = await web.conversations.history({
      channel,
      limit: 1000,
    });
    if (
      !('messages' in resultMessages) ||
      !Array.isArray(resultMessages.messages)
    ) {
      throw new Error('InvalidResponseFromSlackApi');
    }
    expect(resultMessages.messages[0].text).toEqual('should be not deleted');
  });
});
const postMessage = async (token: string, channel: string, text: string) => {
  const web = new WebClient(token);
  await web.conversations.join({ channel });

  const result = await web.chat.postMessage({
    channel,
    text,
  });
  if (!result.ok) {
    throw new Error('Failed to post message');
  }
  return result;
};
