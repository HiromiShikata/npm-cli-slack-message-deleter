#!/usr/bin/env node
import { Command } from 'commander';
import { DeleteOldMessagesUseCase } from '../../../domain/usecases/DeleteSlackMessageUseCase';
import { WebApiSlackRepository } from '../../repositories/WebApiSlackRepository';

const program = new Command();

program
  .name('slack-message-deleter')
  .description('Clean up old messages in slack channel')
  .requiredOption('-t, --token <string>', 'SlackBotToken')
  .requiredOption('-c, --channel <string>', 'ChannelId')
  .requiredOption(
    '-m, --minutes <number>',
    'DeleteMessagesOlderThanThisNumberOfMinutes',
    parseInt,
  )
  .action(
    async (options: { token: string; channel: string; minutes: number }) => {
      const slackRepository = new WebApiSlackRepository(options.token);
      const useCase = new DeleteOldMessagesUseCase(slackRepository);
      const result = await useCase.execute({
        channelId: options.channel,
        minutesAgo: options.minutes,
      });
      console.log(`Deleted ${result.deletedCount} messages`);
    },
  );

if (process.argv) {
  program.parse(process.argv);
}
