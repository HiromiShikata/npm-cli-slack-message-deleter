import { WebApiSlackRepository } from './WebApiSlackRepository';
import { config } from 'dotenv';
import { WebClient } from '@slack/web-api';

config();

const describeIfSlackToken = process.env.SLACK_BOT_TOKEN
  ? describe
  : describe.skip;

describeIfSlackToken('WebApiSlackRepository', () => {
  it('should delete message', async () => {
    const token = process.env.SLACK_BOT_TOKEN || '';
    const channel = process.env.SLACK_CHANNEL_ID || 'CFNN90G07';
    const slackRepository = new WebApiSlackRepository(token);
    await slackRepository.joinChannel(channel);
    const web = new WebClient(token);

    const resultPostMessageWithThread = await web.chat.postMessage({
      channel,
      text: 'should be delete text with thread',
    });
    await web.chat.postMessage({
      channel,
      text: 'should be delete text in thread',
      thread_ts: resultPostMessageWithThread.ts,
    });
    const resultPostMessageWithoutThread = await web.chat.postMessage({
      channel,
      text: 'should be delete text without thread',
    });
    if (!resultPostMessageWithoutThread.ok) {
      throw new Error('Failed to post message');
    }

    const resultMessages = await slackRepository.getMessages(channel);
    expect(resultMessages.messages.length).toBeGreaterThan(0);
    expect(resultMessages.messages[0].ts).toEqual(
      resultPostMessageWithoutThread.ts,
    );
    expect(resultMessages.messages[1].ts).toEqual(
      resultPostMessageWithThread.ts,
    );
    for (const message of resultMessages.messages) {
      await slackRepository.deleteMessage(channel, message.ts);
    }
    const resultMessagesAfterDelete =
      await slackRepository.getMessages(channel);
    expect(
      resultMessagesAfterDelete.messages.filter(
        (message) => message.ts === resultPostMessageWithoutThread.ts,
      ).length,
    ).toEqual(0);
  });
});
