import { mock } from 'jest-mock-extended';
import type { SQSClient } from '@aws-sdk/client-sqs';
import {
  makeEventBridgeEvent,
  makeS3ObjectCreatedEventDetail,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { createHandler } from '../../api/forward-initial-render-request';

function setup() {
  const { logger } = createMockLogger();
  const mocks = {
    sqsClient: mock<SQSClient>(),
    renderRequestQueueUrl:
      'https://sqs.eu-west-2.amazonaws.com/123456789012/render-queue.fifo',
    logger,
  };
  const handler = createHandler(mocks);

  return { handler, mocks };
}

const makeS3ObjectCreatedEvent = (
  detail: Parameters<typeof makeS3ObjectCreatedEventDetail>[0]
) =>
  makeEventBridgeEvent({
    source: 'aws.s3',
    'detail-type': 'Object Created',
    detail: makeS3ObjectCreatedEventDetail(detail),
  });

describe('createHandler', () => {
  it('sends the initial render request to the queue', async () => {
    const { handler, mocks } = setup();

    const event = makeS3ObjectCreatedEvent({
      object: {
        key: 'docx-template/client-123/template-456/version-789.docx',
      },
    });

    await handler(event);

    expect(mocks.sqsClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          QueueUrl: mocks.renderRequestQueueUrl,
          MessageBody: JSON.stringify({
            requestType: 'initial',
            clientId: 'client-123',
            templateId: 'template-456',
            currentVersion: 'version-789',
          }),
          MessageGroupId: 'client-123',
        },
      })
    );
  });

  it('errors if the event has no object key', async () => {
    const { handler, mocks } = setup();

    await expect(
      handler({
        detail: {
          object: {},
        },
      })
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(mocks.sqsClient.send).not.toHaveBeenCalled();
  });

  it('errors if the key has invalid format', async () => {
    const { handler, mocks } = setup();

    const event = makeS3ObjectCreatedEvent({
      object: {
        key: 'only/two',
      },
    });

    await expect(handler(event)).rejects.toThrow('Unexpected object key');

    expect(mocks.sqsClient.send).not.toHaveBeenCalled();
  });

  it('errors if the file type is not docx-template', async () => {
    const { handler, mocks } = setup();

    const event = makeS3ObjectCreatedEvent({
      object: {
        key: 'pdf-template/client-123/template-456/version-789.pdf',
      },
    });

    await expect(handler(event)).rejects.toThrow(
      'Expected file type "docx-template" but got "pdf-template"'
    );

    expect(mocks.sqsClient.send).not.toHaveBeenCalled();
  });
});
