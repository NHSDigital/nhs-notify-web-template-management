import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/send-handler';
import { App } from '../../app/request-proof';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { SftpSupplierClientRepository } from '../../infra/sftp-supplier-client-repository';
import { Callback, Context } from 'aws-lambda';
import { makeSQSRecord } from 'nhs-notify-web-template-management-test-helper-utils';

function setup() {
  const app = mock<App>();

  const { logger, logMessages } = createMockLogger();

  const sftpSupplierClientRepository = mock<SftpSupplierClientRepository>();

  const handler = createHandler({
    app,
    logger,
  });

  return {
    handler,
    mocks: { app, sftpSupplierClientRepository, logger },
    logMessages,
  };
}

describe('handler', () => {
  test('handles proof requests', async () => {
    const { mocks, handler, logMessages } = setup();

    mocks.app.send
      .mockResolvedValueOnce('sent')
      .mockRejectedValueOnce(new Error('!'))
      .mockResolvedValueOnce('failed')
      .mockResolvedValueOnce('already-sent');

    const record1 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'a' });
    const record2 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'b' });
    const record3 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'c' });
    const record4 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'd' });
    const records = [record1, record2, record3, record4];

    const response = await handler(
      {
        Records: records,
      },
      mock<Context>(),
      mock<Callback>()
    );

    expect(mocks.app.send).toHaveBeenCalledTimes(4);
    for (const record of records) {
      expect(mocks.app.send).toHaveBeenCalledWith(
        record.body,
        record.messageId
      );
    }

    expect(response).toEqual({
      batchItemFailures: [{ itemIdentifier: 'b' }, { itemIdentifier: 'c' }],
    });

    // logs rejections
    expect(logMessages).toContainEqual(
      expect.objectContaining({
        description: 'Could not process proofing request',
        level: 'error',
        message: '!',
      })
    );

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        message: { 'already-sent': 1, failed: 2, sent: 1 },
      })
    );
  });
});
