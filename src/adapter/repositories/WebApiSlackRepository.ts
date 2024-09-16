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
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(`FailedToDeleteMessage: ${ts}. UnknownError`);
      }
      if (error.message.endsWith('cant_delete_message')) {
        return;
      }
      throw new Error(`FailedToDeleteMessage: ${ts}. Error: ${error.message}`);
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
