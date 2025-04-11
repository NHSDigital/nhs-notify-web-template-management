import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/send-handler';
import { App } from '../../app/send';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { SftpSupplierClientRepository } from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { Callback, Context } from 'aws-lambda';
import { makeSQSRecord } from 'nhs-notify-web-template-management-test-helper-utils';

const defaultSupplier = 'LETTERSUPPLIER';
const baseUploadDir = 'Incoming';
const baseDownloadDir = 'Outgoing';

function setup() {
  const app = mock<App>();

  const { logger, logMessages } = createMockLogger();

  const sftpSupplierClientRepository = mock<SftpSupplierClientRepository>();

  const handler = createHandler({
    app,
    sftpSupplierClientRepository,
    defaultSupplier,
    logger,
  });

  return {
    handler,
    mocks: { app, sftpSupplierClientRepository, logger },
    logMessages,
  };
}

describe('handler', () => {
  test('opens SFTP connection, handles proof requests, and closes connection', async () => {
    const { mocks, handler, logMessages } = setup();

    const client = mock<SftpClient>();

    client.connect.mockResolvedValueOnce();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient: client,
      baseDownloadDir,
      baseUploadDir,
    });

    mocks.app.send
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('!'))
      .mockResolvedValueOnce();

    client.end.mockResolvedValueOnce();

    const record1 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'a' });
    const record2 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'b' });
    const record3 = makeSQSRecord({ body: JSON.stringify({}), messageId: 'c' });
    const records = [record1, record2, record3];

    const response = await handler(
      {
        Records: records,
      },
      mock<Context>(),
      mock<Callback>()
    );

    expect(mocks.sftpSupplierClientRepository.getClient).toHaveBeenCalledTimes(
      1
    );
    expect(mocks.sftpSupplierClientRepository.getClient).toHaveBeenCalledWith(
      defaultSupplier
    );

    expect(client.connect).toHaveBeenCalledTimes(1);

    expect(mocks.app.send).toHaveBeenCalledTimes(3);
    for (const record of records) {
      expect(mocks.app.send).toHaveBeenCalledWith(
        record.body,
        record.messageId,
        client,
        baseUploadDir
      );
    }

    expect(client.end).toHaveBeenCalledTimes(1);

    expect(response).toEqual({ batchItemFailures: [{ itemIdentifier: 'b' }] });

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        message: { failureCount: 1, sentCount: 2 },
        recordCount: 3,
        supplier: defaultSupplier,
      })
    );
  });

  test('logs error and resolves when failing to close SFTP connection', async () => {
    const { mocks, handler, logMessages } = setup();

    const client = mock<SftpClient>();

    client.connect.mockResolvedValueOnce();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient: client,
      baseDownloadDir,
      baseUploadDir,
    });

    mocks.app.send.mockResolvedValue();

    const error = new Error('close error');

    client.end.mockRejectedValue(error);

    const response = await handler(
      {
        Records: [],
      },
      mock<Context>(),
      mock<Callback>()
    );

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.end).toHaveBeenCalledTimes(1);

    expect(response).toEqual({ batchItemFailures: [] });

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        description: 'Failed to close SFTP connection',
        recordCount: 0,
        message: error.message,
        stack: error.stack,
      })
    );
  });
});
