import { DeleteOldMessagesUseCase } from './DeleteSlackMessageUseCase';

describe('DeleteOldMessagesUseCase', () => {
  describe('execute', () => {
    interface TestCase {
      name: string;
      input: { channelId: string; minutesAgo: number };
      messages: { ts: string }[];
      expectedDeletedCount: number;
      expectedJoinedChannel: boolean;
      shouldJoinSucceed: boolean;
    }

    const testCases: TestCase[] = [
      {
        name: 'DeletesAllMessagesWhenAllAreOld',
        input: { channelId: 'channel1', minutesAgo: 60 },
        messages: [{ ts: '1600000000.000000' }, { ts: '1600000001.000000' }],
        expectedDeletedCount: 2,
        expectedJoinedChannel: true,
        shouldJoinSucceed: true,
      },
      {
        name: 'DeletesNoMessagesWhenAllAreNew',
        input: { channelId: 'channel2', minutesAgo: 30 },
        messages: [{ ts: '9999999999.000000' }, { ts: '9999999998.000000' }],
        expectedDeletedCount: 0,
        expectedJoinedChannel: true,
        shouldJoinSucceed: true,
      },
      {
        name: 'DeletesSomeMessagesWhenSomeAreOld',
        input: { channelId: 'channel3', minutesAgo: 45 },
        messages: [{ ts: '1600000000.000000' }, { ts: '9999999999.000000' }],
        expectedDeletedCount: 1,
        expectedJoinedChannel: true,
        shouldJoinSucceed: true,
      },
      {
        name: 'HandlesJoinChannelFailure',
        input: { channelId: 'channel4', minutesAgo: 60 },
        messages: [{ ts: '1600000000.000000' }, { ts: '1600000001.000000' }],
        expectedDeletedCount: 2,
        expectedJoinedChannel: false,
        shouldJoinSucceed: false,
      },
    ];

    test.each(testCases)('$name', async (testCase) => {
      const {
        input,
        messages,
        expectedDeletedCount,
        expectedJoinedChannel,
        shouldJoinSucceed,
      } = testCase;
      const { useCase, mockSlackRepository } =
        createUseCaseAndMockRepositories();

      if (shouldJoinSucceed) {
        mockSlackRepository.joinChannel.mockResolvedValue(undefined);
      } else {
        mockSlackRepository.joinChannel.mockRejectedValue(
          new Error('JoinFailed'),
        );
      }

      mockSlackRepository.getMessages.mockResolvedValue({
        messages,
        nextCursor: undefined,
      });

      const result = await useCase.execute(input);

      expect(result.deletedCount).toBe(expectedDeletedCount);
      expect(result.joinedChannel).toBe(expectedJoinedChannel);
      expect(mockSlackRepository.joinChannel).toHaveBeenCalledWith(
        input.channelId,
      );
      expect(mockSlackRepository.getMessages).toHaveBeenCalledWith(
        input.channelId,
        undefined,
      );
      expect(mockSlackRepository.deleteMessage).toHaveBeenCalledTimes(
        expectedDeletedCount,
      );
    });

    test('StopsDeleteAfterReachingNewMessage', async () => {
      const input = { channelId: 'channel5', minutesAgo: 50 };
      const messages = [
        { ts: '1600000000.000000' },
        { ts: '1600000001.000000' },
        { ts: '9999999999.000000' },
        { ts: '1600000002.000000' },
      ];

      const { useCase, mockSlackRepository } =
        createUseCaseAndMockRepositories();
      mockSlackRepository.joinChannel.mockResolvedValue(undefined);
      mockSlackRepository.getMessages.mockResolvedValue({
        messages,
        nextCursor: undefined,
      });

      const result = await useCase.execute(input);

      expect(result.deletedCount).toBe(2);
      expect(result.joinedChannel).toBe(true);
      expect(mockSlackRepository.deleteMessage).toHaveBeenCalledTimes(2);
    });

    test('HandlesMultiplePages', async () => {
      const input = { channelId: 'channel6', minutesAgo: 60 };
      const page1Messages = [
        { ts: '1600000000.000000' },
        { ts: '1600000001.000000' },
      ];
      const page2Messages = [
        { ts: '1600000002.000000' },
        { ts: '1600000003.000000' },
      ];

      const { useCase, mockSlackRepository } =
        createUseCaseAndMockRepositories();
      mockSlackRepository.joinChannel.mockResolvedValue(undefined);
      mockSlackRepository.getMessages
        .mockResolvedValueOnce({
          messages: page1Messages,
          nextCursor: 'next_cursor',
        })
        .mockResolvedValueOnce({
          messages: page2Messages,
          nextCursor: undefined,
        });

      const result = await useCase.execute(input);

      expect(result.deletedCount).toBe(4);
      expect(result.joinedChannel).toBe(true);
      expect(mockSlackRepository.getMessages).toHaveBeenCalledTimes(2);
      expect(mockSlackRepository.getMessages).toHaveBeenCalledWith(
        input.channelId,
        undefined,
      );
      expect(mockSlackRepository.getMessages).toHaveBeenCalledWith(
        input.channelId,
        'next_cursor',
      );
      expect(mockSlackRepository.deleteMessage).toHaveBeenCalledTimes(4);
    });
  });
});

const createUseCaseAndMockRepositories = () => {
  const mockSlackRepository = createMockSlackRepository();
  const useCase = new DeleteOldMessagesUseCase(mockSlackRepository);
  return { useCase, mockSlackRepository };
};
const createMockSlackRepository = () => {
  return {
    joinChannel: jest.fn().mockImplementation(async () => {}),
    getMessages: jest.fn().mockImplementation(async () => ({
      messages: [],
      nextCursor: undefined,
    })),
    deleteMessage: jest.fn().mockImplementation(async () => {}),
  };
};
