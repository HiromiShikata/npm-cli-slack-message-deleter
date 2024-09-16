import { SlackMessage } from '../../entities/SlackMessage';

export interface SlackRepository {
  getMessages(
    channelId: string,
    cursor?: string,
  ): Promise<{ messages: SlackMessage[]; nextCursor?: string }>;
  deleteMessage(channelId: string, ts: string): Promise<void>;
  joinChannel(channelId: string): Promise<void>;
}
