import { mock } from 'jest-mock-extended';
import type { SQSClient } from '@aws-sdk/client-sqs';
import {
  makeEventBridgeEvent,
  makeS3ObjectCreatedEventDetail,
} from 'nhs-notify-web-template-management-test-helper-utils';
import {
  createHandler,
  keyToInitialRenderRequest,
} from '../../api/forward-initial-render-request';

function setup() {
  const mocks = {
    sqsClient: mock<SQSClient>(),
    renderRequestQueueUrl:
      'https://sqs.eu-west-2.amazonaws.com/123456789012/render-queue.fifo',
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
        key: 'letters/client-123/template-456/file.pdf',
      },
    });

    await handler(event);

    expect(mocks.sqsClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          QueueUrl: mocks.renderRequestQueueUrl,
          MessageBody: JSON.stringify({
            requestType: 'initial',
            template: { templateId: 'template-456', clientId: 'client-123' },
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

  it('errors if the key has too few path segments', async () => {
    const { handler, mocks } = setup();

    const event = makeS3ObjectCreatedEvent({
      object: {
        key: 'only/two',
      },
    });

    await expect(handler(event)).rejects.toThrow(
      'Expected four path segments in only/two'
    );

    expect(mocks.sqsClient.send).not.toHaveBeenCalled();
  });

  it('errors if the key has too many path segments', async () => {
    const { handler, mocks } = setup();

    const event = makeS3ObjectCreatedEvent({
      object: {
        key: 'one/two/three/four/five',
      },
    });

    await expect(handler(event)).rejects.toThrow(
      'Expected four path segments in one/two/three/four/five'
    );

    expect(mocks.sqsClient.send).not.toHaveBeenCalled();
  });
});

describe('keyToInitialRenderRequest', () => {
  it('parses the key into an initial render request', () => {
    const result = keyToInitialRenderRequest(
      'letters/client-123/template-456/file.pdf'
    );

    expect(result).toEqual({
      requestType: 'initial',
      template: { templateId: 'template-456', clientId: 'client-123' },
    });
  });

  it('extracts clientId from the second path segment', () => {
    const result = keyToInitialRenderRequest(
      'prefix/my-client-id/my-template-id/filename.pdf'
    );

    expect(result.template.clientId).toBe('my-client-id');
  });

  it('extracts templateId from the third path segment', () => {
    const result = keyToInitialRenderRequest(
      'prefix/my-client-id/my-template-id/filename.pdf'
    );

    expect(result.template.templateId).toBe('my-template-id');
  });

  it('throws if the key has fewer than four segments', () => {
    expect(() => keyToInitialRenderRequest('one/two/three')).toThrow(
      'Expected four path segments in one/two/three'
    );
  });

  it('throws if the key has more than four segments', () => {
    expect(() => keyToInitialRenderRequest('one/two/three/four/five')).toThrow(
      'Expected four path segments in one/two/three/four/five'
    );
  });
});
