import { mockDeep } from 'jest-mock-extended';
import { App } from '../../app/app';
import { SNSRepository } from '../../infra/sns-repository';
import { SharedFileRepository } from '../../infra/shared-file-repository';
import { EventBuilder } from '../../domain/event-builder';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { Event } from '../../domain/output-schemas';
import { PublishableEventRecord } from '../../domain/input-schemas';

const mockPublishableEventRecord = mockDeep<PublishableEventRecord>();
const mockEvent = mockDeep<Event>();

const mockSnsRepository = mockDeep<SNSRepository>({
  publish: jest.fn(),
});

const mockEventBuilder = mockDeep<EventBuilder>({
  buildEvent: jest.fn(),
});

const mockSharedFileRepository = mockDeep<SharedFileRepository>({
  upload: jest.fn(),
});

const mockLogger = mockDeep<Logger>();

const app = new App(
  mockSnsRepository,
  mockEventBuilder,
  mockSharedFileRepository,
  mockLogger
);

beforeEach(() => jest.resetAllMocks());

test('publishes event', async () => {
  mockEventBuilder.buildEvent.mockReturnValue({ event: mockEvent });

  await app.publishEvent(mockPublishableEventRecord);

  expect(mockEventBuilder.buildEvent).toHaveBeenCalledWith(
    mockPublishableEventRecord
  );

  expect(mockSnsRepository.publish).toHaveBeenCalledWith(mockEvent);
});

test('does not publish event', async () => {
  mockEventBuilder.buildEvent.mockReturnValue(undefined);

  await app.publishEvent(mockPublishableEventRecord);

  expect(mockEventBuilder.buildEvent).toHaveBeenCalledWith(
    mockPublishableEventRecord
  );

  expect(mockSnsRepository.publish).not.toHaveBeenCalled();
});

test('uploads shared files before publishing event', async () => {
  mockEventBuilder.buildEvent.mockReturnValue({
    event: mockEvent,
    sharedFiles: {
      'source/key.pdf': 'destination/key.pdf',
    },
  });

  await app.publishEvent(mockPublishableEventRecord);

  expect(mockSharedFileRepository.upload).toHaveBeenCalledWith(
    'source/key.pdf',
    'destination/key.pdf'
  );

  expect(mockSnsRepository.publish).toHaveBeenCalledWith(mockEvent);
});
