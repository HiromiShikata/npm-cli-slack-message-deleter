import { WebClient } from '@slack/web-api';
import { SlackRepository } from '../../domain/usecases/adapter-interfaces/SlackRepository';
import { SlackMessage } from '../../domain/entities/SlackMessage';

export class WebApiSlackRepository implements SlackRepository {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async getMessages(
    channelId: string,
    cursor?: string,
  ): Promise<{ messages: SlackMessage[]; nextCursor?: string }> {
    const result = await this.client.conversations.history({
      channel: channelId,
      limit: 1000,
      cursor: cursor,
    });

    if (!('messages' in result) || !Array.isArray(result.messages)) {
      throw new Error('InvalidResponseFromSlackApi');
    }

    return {
      messages: result.messages.filter(
        (message): message is SlackMessage =>
          'ts' in message && typeof message.ts === 'string',
      ),
      nextCursor: result.response_metadata?.next_cursor,
    };
  }

  async deleteMessage(channelId: string, ts: string): Promise<void> {
    try {
      await this.client.chat.delete({
        channel: channelId,
        ts: ts,
      });

      await this.deleteThreadReplies(channelId, ts);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('message_not_found')) {
          await this.deleteThreadReplies(channelId, ts);
          return;
        }
        throw new Error(
          `FailedToDeleteMessage: ${ts}. Error: ${error.message}`,
        );
      }
      throw new Error(`FailedToDeleteMessage: ${ts}. UnknownError`);
    }
  }

  private async deleteThreadReplies(
    channelId: string,
    threadTs: string,
  ): Promise<void> {
    try {
      const repliesResult = await this.client.conversations.replies({
        channel: channelId,
        ts: threadTs,
      });

      if (
        'messages' in repliesResult &&
        Array.isArray(repliesResult.messages) &&
        repliesResult.messages.length > 1
      ) {
        const threadMessages = repliesResult.messages.slice(1);
        for (const threadMessage of threadMessages) {
          if ('ts' in threadMessage && typeof threadMessage.ts === 'string') {
            await this.deleteMessage(channelId, threadMessage.ts);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('thread_not_found')) {
          return;
        }
      }
      throw error;
    }
  }

  async joinChannel(channelId: string): Promise<void> {
    try {
      await this.client.conversations.join({ channel: channelId });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('channel_not_found') ||
          error.message.includes('is_private')
        ) {
          throw new Error(
            `CannotJoinChannel: ${channelId}. ChannelNotFoundOrPrivate`,
          );
        }
        if (error.message.includes('already_in_channel')) {
          return;
        }
        throw new Error(
          `FailedToJoinChannel: ${channelId}. Error: ${error.message}`,
        );
      }
      throw new Error(`FailedToJoinChannel: ${channelId}. UnknownError`);
    }
  }
}
