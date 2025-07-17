import { mockDeep } from 'jest-mock-extended';
import { SNSClient } from '@aws-sdk/client-sns';
import { SNSRepository } from '../../infra/sns-repository';
import type { Event } from '../../domain/output-schemas';

const mockSnsClient = mockDeep<SNSClient>({
  send: jest.fn(),
});

const mockEvent = mockDeep<Event>();

test('calls AWS SDK to publish event', async () => {
  const snsRepository = new SNSRepository(mockSnsClient, 'topic-arn');

  await snsRepository.publish(mockEvent);

  expect(mockSnsClient.send).toHaveBeenCalledWith(
    expect.objectContaining({
      input: expect.objectContaining({
        Message: JSON.stringify(mockEvent),
        TopicArn: 'topic-arn',
      }),
    })
  );
});
