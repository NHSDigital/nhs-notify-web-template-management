import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { EventsClient } from '@backend-api/templates/infra/events-client';

jest.mock('nhs-notify-web-template-management-utils/logger');

const setup = () => {
  const eventbridge = mockClient(EventBridgeClient);

  eventbridge.on(PutEventsCommand).resolves({});

  const client = new EventsClient('event-source', 'bus-name');

  return { client, mocks: { eventbridge } };
};

describe('EventsClient', () => {
  it('sends event to eventbridge', async () => {
    const { client, mocks } = setup();

    await client.putEvent({
      'detail-type': 'test-event',
      detail: { foo: 'bar' },
    });

    expect(mocks.eventbridge).toHaveReceivedCommandWith(PutEventsCommand, {
      Entries: [
        {
          EventBusName: 'bus-name',
          Source: 'event-source',
          DetailType: 'test-event',
          Detail: JSON.stringify({ foo: 'bar' }),
        },
      ],
    });
  });

  it('uses default bus name', async () => {
    const { mocks } = setup();

    const client = new EventsClient('event-source');

    await client.putEvent({
      'detail-type': 'test-event',
      detail: { foo: 'bar' },
    });

    expect(mocks.eventbridge).toHaveReceivedCommandWith(PutEventsCommand, {
      Entries: [
        {
          EventBusName: 'default',
          Source: 'event-source',
          DetailType: 'test-event',
          Detail: JSON.stringify({ foo: 'bar' }),
        },
      ],
    });
  });

  it('raises an exception on failed entries', async () => {
    const { client, mocks } = setup();

    mocks.eventbridge.on(PutEventsCommand).resolvesOnce({
      FailedEntryCount: 1,
      Entries: [
        {
          EventId: 'event-id',
          ErrorCode: 'something went wrong',
          ErrorMessage: 'SOMETHING WENT WRONG',
        },
      ],
    });

    await expect(
      client.putEvent({ 'detail-type': 'test-event', detail: { foo: 'bar' } })
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
