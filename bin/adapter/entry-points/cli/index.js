#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const DeleteSlackMessageUseCase_1 = require("../../../domain/usecases/DeleteSlackMessageUseCase");
const WebApiSlackRepository_1 = require("../../repositories/WebApiSlackRepository");
const program = new commander_1.Command();
program
    .name('slack-message-deleter')
    .description('Clean up old messages in slack channel')
    .requiredOption('-t, --token <string>', 'SlackBotToken')
    .requiredOption('-c, --channel <string>', 'ChannelId')
    .requiredOption('-m, --minutes <number>', 'DeleteMessagesOlderThanThisNumberOfMinutes', parseInt)
    .action(async (options) => {
    const slackRepository = new WebApiSlackRepository_1.WebApiSlackRepository(options.token);
    const useCase = new DeleteSlackMessageUseCase_1.DeleteOldMessagesUseCase(slackRepository);
    const result = await useCase.execute({
        channelId: options.channel,
        minutesAgo: options.minutes,
    });
    console.log(`Deleted ${result.deletedCount} messages`);
});
if (process.argv) {
    program.parse(process.argv);
}
//# sourceMappingURL=index.js.map