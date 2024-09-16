"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOldMessagesUseCase = void 0;
class DeleteOldMessagesUseCase {
    constructor(slackRepository) {
        this.slackRepository = slackRepository;
    }
    async execute(input) {
        const { channelId, minutesAgo } = input;
        const thresholdTimestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
        let cursor;
        let deletedCount = 0;
        const maxIteration = 20;
        let joinedChannel = false;
        try {
            await this.slackRepository.joinChannel(channelId);
            joinedChannel = true;
        }
        catch (error) {
            console.error(`FailedToJoinChannel: ${channelId}. ProceedingWithoutJoining.`);
        }
        for (let i = 0; i < maxIteration; i++) {
            const { messages, nextCursor } = await this.slackRepository.getMessages(channelId, cursor);
            for (const message of messages) {
                const messageTimestamp = new Date(parseInt(message.ts) * 1000);
                if (messageTimestamp < thresholdTimestamp) {
                    await this.slackRepository.deleteMessage(channelId, message.ts);
                    deletedCount++;
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
exports.DeleteOldMessagesUseCase = DeleteOldMessagesUseCase;
//# sourceMappingURL=DeleteSlackMessageUseCase.js.map