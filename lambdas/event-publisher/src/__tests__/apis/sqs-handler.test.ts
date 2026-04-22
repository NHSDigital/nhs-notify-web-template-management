import { mockDeep } from 'jest-mock-extended';
import type { SQSEvent, SQSRecord } from 'aws-lambda';
import { App } from '../../app/app';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { createHandler } from '../../apis/sqs-handler';

const mockApp = mockDeep<App>({
  publishEvent: jest.fn(),
});

const mockLogger = mockDeep<Logger>();

const handler = createHandler({ app: mockApp, logger: mockLogger });

beforeEach(() => jest.resetAllMocks());

const createSQSRecord = (messageId: string, body: unknown): SQSRecord => ({
  ...mockDeep<SQSRecord>(),
  messageId,
  body: JSON.stringify(body),
});

const validRecordBody = {
  eventID: 'event-1',
  dynamodb: {
    NewImage: {},
    SequenceNumber: '123',
  },
  tableName: 'my-table',
};

test('processes a single record successfully', async () => {
  const event = mockDeep<SQSEvent>({
    Records: [createSQSRecord('msg-1', validRecordBody)],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockApp.publishEvent).toHaveBeenCalledWith(validRecordBody);
  expect(result).toEqual({ batchItemFailures: [] });
});

test('processes multiple records successfully', async () => {
  const secondRecordBody = {
    ...validRecordBody,
    eventID: 'event-2',
  };

  const event = mockDeep<SQSEvent>({
    Records: [
      createSQSRecord('msg-1', validRecordBody),
      createSQSRecord('msg-2', secondRecordBody),
    ],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockApp.publishEvent).toHaveBeenCalledTimes(2);
  expect(mockApp.publishEvent).toHaveBeenCalledWith(validRecordBody);
  expect(mockApp.publishEvent).toHaveBeenCalledWith(secondRecordBody);
  expect(result).toEqual({ batchItemFailures: [] });
});

test('reports batch item failure when JSON parsing fails', async () => {
  const event = mockDeep<SQSEvent>({
    Records: [
      { ...mockDeep<SQSRecord>(), messageId: 'msg-1', body: 'not-json' },
    ],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockApp.publishEvent).not.toHaveBeenCalled();
  expect(mockLogger.error).toHaveBeenCalled();
  expect(result).toEqual({
    batchItemFailures: [{ itemIdentifier: 'msg-1' }],
  });
});

test('reports batch item failure when schema validation fails', async () => {
  const event = mockDeep<SQSEvent>({
    Records: [createSQSRecord('msg-1', { invalid: 'data' })],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockApp.publishEvent).not.toHaveBeenCalled();
  expect(mockLogger.error).toHaveBeenCalled();
  expect(result).toEqual({
    batchItemFailures: [{ itemIdentifier: 'msg-1' }],
  });
});

test('reports batch item failure when app.publishEvent throws', async () => {
  mockApp.publishEvent.mockRejectedValueOnce(new Error('publish failed'));

  const event = mockDeep<SQSEvent>({
    Records: [createSQSRecord('msg-1', validRecordBody)],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error));
  expect(result).toEqual({
    batchItemFailures: [{ itemIdentifier: 'msg-1' }],
  });
});

test('reports failures only for failed records in a mixed batch', async () => {
  mockApp.publishEvent
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error('publish failed'))
    .mockResolvedValueOnce(undefined);

  const event = mockDeep<SQSEvent>({
    Records: [
      createSQSRecord('msg-1', validRecordBody),
      createSQSRecord('msg-2', validRecordBody),
      createSQSRecord('msg-3', validRecordBody),
    ],
  });

  const result = await handler(event, mockDeep(), mockDeep());

  expect(mockApp.publishEvent).toHaveBeenCalledTimes(3);
  expect(result).toEqual({
    batchItemFailures: [{ itemIdentifier: 'msg-2' }],
  });
});
