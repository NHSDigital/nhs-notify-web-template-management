import { mockDeep } from 'jest-mock-extended';
import { App } from '../../app/app';
import { SNSRepository } from '../../infra/sns-repository';
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

const mockLogger = mockDeep<Logger>();

const app = new App(mockSnsRepository, mockEventBuilder, mockLogger);

beforeEach(() => jest.resetAllMocks());

test('publishes event', async () => {
  mockEventBuilder.buildEvent.mockReturnValue(mockEvent);

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
