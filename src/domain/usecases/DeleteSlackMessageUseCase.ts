import { SlackRepository } from './adapter-interfaces/SlackRepository';

export class DeleteOldMessagesUseCase {
  constructor(readonly slackRepository: SlackRepository) {}

  async execute(input: { channelId: string; minutesAgo: number }): Promise<{
    deletedCount: number;
    joinedChannel: boolean;
  }> {
    const { channelId, minutesAgo } = input;
    const thresholdTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
    let cursor: string | undefined;
    let deletedCount = 0;
    const maxIteration = 20;

    let joinedChannel = false;
    try {
      await this.slackRepository.joinChannel(channelId);
      joinedChannel = true;
    } catch (error) {
      console.error(
        `FailedToJoinChannel: ${channelId}. ProceedingWithoutJoining.`,
      );
    }

    for (let i = 0; i < maxIteration; i++) {
      const { messages, nextCursor } = await this.slackRepository.getMessages(
        channelId,
        cursor,
      );

      for (const message of messages) {
        const messageTimestamp = new Date(parseInt(message.ts) * 1000);
        if (messageTimestamp < thresholdTimestamp) {
          await this.slackRepository.deleteMessage(channelId, message.ts);
          deletedCount++;
        } else {
          return { deletedCount, joinedChannel };
        }
      }

      if (!nextCursor) {
        break;
      }
      cursor = nextCursor;
    }

    return { deletedCount, joinedChannel };
  }
}
