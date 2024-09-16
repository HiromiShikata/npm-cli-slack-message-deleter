import { WebApiSlackRepository } from './WebApiSlackRepository';
import { config } from 'dotenv';
import { WebClient } from '@slack/web-api';

config();

describe('WebApiSlackRepository', () => {
  it('should delete message', async () => {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      throw new Error('SLACK_BOT_TOKEN is not set');
    }
    const channel = process.env.SLACK_CHANNEL_ID || 'CFNN90G07';
    const slackRepository = new WebApiSlackRepository(token);
    await slackRepository.joinChannel(channel);
    const web = new WebClient(token);
    const resultPostMessage = await web.chat.postMessage({
      channel,
      text: 'should be delete text',
    });
    if (!resultPostMessage.ok) {
      throw new Error('Failed to post message');
    }

    const resultMessages = await slackRepository.getMessages(channel);
    expect(resultMessages.messages.length).toBeGreaterThan(0);
    expect(resultMessages.messages[0].ts).toEqual(resultPostMessage.ts);
    for (const message of resultMessages.messages) {
      await slackRepository.deleteMessage(channel, message.ts);
    }
    const resultMessagesAfterDelete =
      await slackRepository.getMessages(channel);
    expect(
      resultMessagesAfterDelete.messages.filter(
        (message) => message.ts === resultPostMessage.ts,
      ).length,
    ).toEqual(0);
  });
});
