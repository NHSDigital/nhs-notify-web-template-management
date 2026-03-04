import 'aws-sdk-client-mock-jest';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { mockClient } from 'aws-sdk-client-mock';
import { RenderQueue } from '../../infra/render-queue';

const queueUrl = 'https://sqs.eu-west-2.amazonaws.com/123456789012/render-queue';

const setup = () => {
  const sqsClient = mockClient(SQSClient);

  const renderQueue = new RenderQueue(
    sqsClient as unknown as SQSClient,
    queueUrl
  );

  return { renderQueue, mocks: { sqsClient } };
};

describe('RenderQueue', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('send', () => {
    const templateId = 'template-123';
    const clientId = 'client-456';
    const lockNumber = 1;
    const personalisation = { name: 'Test Name', address: '123 Test St' };
    const requestTypeVariant = 'short' as const;
    const systemPersonalisationPackId = 'pack-id-789';
    const docxCurrentVersion = 'version-abc';

    it('sends message to SQS queue and returns success', async () => {
      const { renderQueue, mocks } = setup();

      mocks.sqsClient.on(SendMessageCommand).resolvesOnce({
        MessageId: 'msg-123',
        $metadata: { httpStatusCode: 200 },
      });

      const result = await renderQueue.send(
        templateId,
        clientId,
        lockNumber,
        personalisation,
        requestTypeVariant,
        systemPersonalisationPackId,
        docxCurrentVersion
      );

      expect(result).toEqual({
        data: {
          MessageId: 'msg-123',
          $metadata: { httpStatusCode: 200 },
        },
      });

      expect(mocks.sqsClient).toHaveReceivedCommandWith(SendMessageCommand, {
        QueueUrl: queueUrl,
        MessageGroupId: clientId,
        MessageBody: JSON.stringify({
          templateId,
          clientId,
          requestType: 'personalised',
          personalisation,
          requestTypeVariant,
          lockNumber,
          systemPersonalisationPackId,
          docxCurrentVersion,
        }),
      });
    });

    it('sends message with long form render variant', async () => {
      const { renderQueue, mocks } = setup();

      mocks.sqsClient.on(SendMessageCommand).resolvesOnce({
        MessageId: 'msg-456',
        $metadata: {},
      });

      await renderQueue.send(
        templateId,
        clientId,
        lockNumber,
        personalisation,
        'long',
        systemPersonalisationPackId,
        docxCurrentVersion
      );

      expect(mocks.sqsClient).toHaveReceivedCommandWith(SendMessageCommand, {
        MessageBody: expect.stringContaining('"requestTypeVariant":"long"'),
      });
    });

    it('returns failure when SQS send fails', async () => {
      const { renderQueue, mocks } = setup();

      const sqsError = new Error('SQS unavailable');
      mocks.sqsClient.on(SendMessageCommand).rejectsOnce(sqsError);

      const result = await renderQueue.send(
        templateId,
        clientId,
        lockNumber,
        personalisation,
        requestTypeVariant,
        systemPersonalisationPackId,
        docxCurrentVersion
      );

      expect(result).toEqual({
        error: {
          actualError: sqsError,
          errorMeta: {
            code: 500,
            description: 'Failed to send to render queue',
          },
        },
      });
    });
  });
});
