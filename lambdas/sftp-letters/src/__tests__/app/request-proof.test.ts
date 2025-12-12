import { mock, mockDeep } from 'jest-mock-extended';
import { TemplateLockRepository } from '../../infra/template-lock-repository';
import { UserDataRepository } from '../../infra/user-data-repository';
import { App } from '../../app/request-proof';
import { SyntheticBatch, Manifest } from '../../domain/synthetic-batch';
import { Readable } from 'node:stream';
import { mockTestDataCsv, streamToString } from '../helpers';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { SftpSupplierClientRepository } from '../../infra/sftp-supplier-client-repository';
import { SftpClient } from '../../infra/sftp-client';
import { ProofingRequest } from 'nhs-notify-web-template-management-utils';
import type { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';

const baseDownloadDir = 'Outgoing';
const baseUploadDir = 'Incoming';
const campaignId = 'mycampaign';
const clientId = 'thisclient';
const language = 'fr';
const letterType = 'x0';
const messageId = 'message-id';
const internalUserId = 'owner-id';
const pdfVersionId = 'pdf-version-id';
const sftpEnvironment = 'nhs-notify-web-template-management-main-app-api';
const supplier = 'LETTER_SUPPLIER';
const templateId = 'template-id';
const templateName = 'template-name';
const testDataVersionId = 'test-data-version-id';

const supplierReference = `${clientId}_${campaignId}_${templateId}_${language}_${letterType}`;

function setup() {
  const userDataRepository = mock<UserDataRepository>();
  const templateRepository = mock<TemplateLockRepository>();
  const emailClient = mockDeep<EmailClient>({
    sendProofRequestedEmailToSupplier: jest.fn(),
  });
  const syntheticBatch = mock<SyntheticBatch>();
  const { logger, logMessages } = createMockLogger();

  const sftpSupplierClientRepository = mock<SftpSupplierClientRepository>();

  const app = new App(
    userDataRepository,
    templateRepository,
    sftpEnvironment,
    syntheticBatch,
    sftpSupplierClientRepository,
    emailClient,
    logger
  );

  return {
    app,
    mocks: {
      userDataRepository,
      templateRepository,
      syntheticBatch,
      logger,
      sftpSupplierClientRepository,
      emailClient,
    },
    logMessages,
  };
}

function mockEvent(
  hasTestData: boolean,
  personalisationParameters: string[]
): ProofingRequest {
  return {
    user: { internalUserId, clientId },
    templateId,
    templateName,
    pdfVersionId,
    supplier,
    language,
    letterType,
    campaignId,
    ...(hasTestData && { testDataVersionId }),
    personalisationParameters,
  };
}

describe('App', () => {
  test('calls dependencies to send a proofing request', async () => {
    const { app, mocks } = setup();

    const personalisationParameters = ['pdsField', 'custom1', 'custom2'];
    const batchColumns = [
      'clientRef',
      'template',
      ...personalisationParameters,
    ];

    const event = mockEvent(true, personalisationParameters);

    const pdfContent = 'mock PDF content';
    const pdf = Readable.from(pdfContent);

    const batchId = `${supplierReference}-0000000000000_pdfversionid`;

    const testData = [
      { custom1: 'short1', custom2: 'short2' },
      { custom1: 'medium1', custom2: 'medium2' },
      { custom1: 'long1', custom2: 'long2' },
    ];

    const batchData = [
      {
        clientRef: 'random1_random2_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal1',
        custom1: 'short1',
        custom2: 'short2',
      },
      {
        clientRef: 'random3_random4_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal2',
        custom1: 'medium1',
        custom2: 'medium2',
      },
      {
        clientRef: 'random5_random6_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal3',
        custom1: 'long1',
        custom2: 'long2',
      },
    ];

    const batchCsv: string = [
      batchColumns.join(','),
      batchData
        .map((x) =>
          [
            `"${x.clientRef}"`,
            `"${x.template}"`,
            `"${x.pdsField}"`,
            `"${x.custom1}"`,
            `"${x.custom2}"`,
          ].join(',')
        )
        .join('\n'),
    ].join('\n');

    const batchHash = 'hash-of-batch-csv';

    const manifestData: Manifest = {
      template: supplierReference,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: batchHash,
    };

    const manifestCsv = [
      'template,batch,records,md5sum',
      `"${supplierReference}","${batchId}.csv","3","${batchHash}"`,
    ].join('\n');

    const testDataCsv = mockTestDataCsv(['custom1', 'custom2'], testData);

    const sftpClient = mock<SftpClient>();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      baseDownloadDir,
      baseUploadDir,
      sftpClient,
    });

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);

    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: testDataCsv,
      pdf,
    });

    mocks.syntheticBatch.buildBatch.mockReturnValueOnce(batchData);

    mocks.syntheticBatch.getHeader.mockReturnValueOnce(batchColumns.join(','));

    mocks.syntheticBatch.buildManifest.mockReturnValueOnce(manifestData);

    mocks.templateRepository.acquireLockAndSetSupplierReference.mockResolvedValueOnce(
      true
    );

    sftpClient.connect.mockResolvedValueOnce();

    // manifest doesn't already exist
    sftpClient.exists.mockResolvedValueOnce(false);

    sftpClient.end.mockResolvedValueOnce();

    const res = await app.send(JSON.stringify(event), messageId);

    expect(res).toBe('sent');

    expect(mocks.sftpSupplierClientRepository.getClient).toHaveBeenCalledTimes(
      1
    );
    expect(mocks.sftpSupplierClientRepository.getClient).toHaveBeenCalledWith(
      supplier
    );

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.userDataRepository.get).toHaveBeenCalledWith(
      clientId,
      templateId,
      pdfVersionId,
      testDataVersionId
    );

    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledWith(
      supplierReference,
      personalisationParameters,
      testData
    );

    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledWith(
      personalisationParameters
    );

    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledWith(
      supplierReference,
      batchId,
      batchCsv
    );

    expect(sftpClient.connect).toHaveBeenCalledTimes(1);

    expect(
      mocks.templateRepository.acquireLockAndSetSupplierReference
    ).toHaveBeenCalledTimes(1);
    expect(
      mocks.templateRepository.acquireLockAndSetSupplierReference
    ).toHaveBeenCalledWith(clientId, templateId, supplier, supplierReference);

    expect(sftpClient.exists).toHaveBeenCalledTimes(1);
    expect(sftpClient.exists).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${supplierReference}/${batchId}_MANIFEST.csv`
    );

    expect(sftpClient.mkdir).toHaveBeenCalledTimes(2);
    expect(sftpClient.mkdir).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/templates/${supplierReference}`,
      true
    );
    expect(sftpClient.mkdir).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${supplierReference}`,
      true
    );

    expect(sftpClient.put).toHaveBeenCalledTimes(3);

    const [pdfPutCall, batchPutCall, manifestPutCall] =
      sftpClient.put.mock.calls;

    const [pdfArg, pdfDestinationArg] = pdfPutCall;

    expect(await streamToString(pdfArg)).toEqual(pdfContent);
    expect(pdfDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/templates/${supplierReference}/${supplierReference}.pdf`
    );

    const [batchArg, batchDestinationArg] = batchPutCall;

    expect(await streamToString(batchArg)).toEqual(batchCsv);
    expect(batchDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/batches/${supplierReference}/${batchId}.csv`
    );

    const [manifestArg, manifestDestinationArg] = manifestPutCall;

    expect(await streamToString(manifestArg)).toEqual(manifestCsv);
    expect(manifestDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/batches/${supplierReference}/${batchId}_MANIFEST.csv`
    );

    expect(
      mocks.emailClient.sendProofRequestedEmailToSupplier
    ).toHaveBeenCalledWith(
      templateId,
      supplierReference,
      templateName,
      supplier
    );

    expect(mocks.templateRepository.finaliseLock).toHaveBeenCalledTimes(1);
    expect(mocks.templateRepository.finaliseLock).toHaveBeenCalledWith(
      clientId,
      templateId
    );

    expect(sftpClient.end).toHaveBeenCalledTimes(1);
  });

  test('throws if proof request event not valid JSON', async () => {
    const { app } = setup();

    await expect(app.send('notjson', messageId)).rejects.toThrow(
      `Unexpected token 'o', "notjson" is not valid JSON`
    );
  });

  test('throws if proof request event is missing a property', async () => {
    const { app } = setup();

    const { personalisationParameters: _, ...invalidEvent } = mockEvent(true, [
      'field',
    ]);

    await expect(
      app.send(JSON.stringify(invalidEvent), messageId)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('exits early and does not send if a lock is already in effect', async () => {
    const { app, mocks, logMessages } = setup();

    const personalisationParameters = ['pdsField'];
    const batchColumns = [
      'clientRef',
      'template',
      ...personalisationParameters,
    ];

    const event = mockEvent(true, personalisationParameters);

    const pdfContent = 'mock PDF content';
    const pdf = Readable.from(pdfContent);

    const batchId = `${supplierReference}-0000000000000_pdfversionid`;

    const batchData = [
      {
        clientRef: 'random1_random2_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal1',
      },
      {
        clientRef: 'random3_random4_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal2',
      },
      {
        clientRef: 'random5_random6_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal3',
      },
    ];

    const manifestData: Manifest = {
      template: supplierReference,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: 'hash-of-batch-csv',
    };

    const sftpClient = mock<SftpClient>();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient,
      baseDownloadDir,
      baseUploadDir,
    });

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);
    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: undefined,
      pdf,
    });
    mocks.syntheticBatch.buildBatch.mockReturnValueOnce(batchData);
    mocks.syntheticBatch.getHeader.mockReturnValueOnce(batchColumns.join(','));
    mocks.syntheticBatch.buildManifest.mockReturnValueOnce(manifestData);
    sftpClient.connect.mockResolvedValueOnce();

    // already locked
    mocks.templateRepository.acquireLockAndSetSupplierReference.mockResolvedValueOnce(
      false
    );
    sftpClient.end.mockResolvedValueOnce();

    const res = await app.send(JSON.stringify(event), messageId);

    expect(res).toBe('already-sent');

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Template is already locked, assuming duplicate event',
      })
    );

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledTimes(1);

    expect(
      mocks.templateRepository.acquireLockAndSetSupplierReference
    ).toHaveBeenCalledTimes(1);
    expect(
      mocks.templateRepository.acquireLockAndSetSupplierReference
    ).toHaveBeenCalledWith(clientId, templateId, supplier, supplierReference);

    expect(sftpClient.connect).toHaveBeenCalled();
    expect(sftpClient.exists).not.toHaveBeenCalled();
    expect(sftpClient.mkdir).not.toHaveBeenCalled();
    expect(sftpClient.put).not.toHaveBeenCalled();
    expect(mocks.templateRepository.finaliseLock).not.toHaveBeenCalled();
    expect(sftpClient.end).toHaveBeenCalledTimes(1);
  });

  test('exits early and does not send if the manifest is already in the SFTP server, finalises existing lock', async () => {
    const { app, mocks, logMessages } = setup();

    const personalisationParameters = ['pdsField'];
    const batchColumns = [
      'clientRef',
      'template',
      ...personalisationParameters,
    ];

    const event = mockEvent(true, personalisationParameters);

    const pdfContent = 'mock PDF content';
    const pdf = Readable.from(pdfContent);

    const batchId = 'template-id-0000000000000_pdfversionid';

    const batchData = [
      {
        clientRef: 'random1_random2_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal1',
      },
      {
        clientRef: 'random3_random4_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal2',
      },
      {
        clientRef: 'random5_random6_1744184100',
        template: supplierReference,
        pdsField: 'pdsVal3',
      },
    ];

    const manifestData: Manifest = {
      template: supplierReference,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: 'hash-of-batch-csv',
    };

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);
    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: undefined,
      pdf,
    });
    mocks.syntheticBatch.buildBatch.mockReturnValueOnce(batchData);
    mocks.syntheticBatch.getHeader.mockReturnValueOnce(batchColumns.join(','));
    mocks.syntheticBatch.buildManifest.mockReturnValueOnce(manifestData);

    const sftpClient = mock<SftpClient>();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient,
      baseDownloadDir,
      baseUploadDir,
    });

    // not already locked
    mocks.templateRepository.acquireLockAndSetSupplierReference.mockResolvedValueOnce(
      true
    );

    sftpClient.connect.mockResolvedValueOnce();

    // but manifest already exists
    sftpClient.exists.mockResolvedValueOnce('-');
    sftpClient.end.mockResolvedValueOnce();

    const res = await app.send(JSON.stringify(event), messageId);

    expect(res).toBe('already-sent');

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Manifest already exists, assuming duplicate event',
      })
    );

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledTimes(1);
    expect(sftpClient.connect).toHaveBeenCalledTimes(1);
    expect(
      mocks.templateRepository.acquireLockAndSetSupplierReference
    ).toHaveBeenCalledTimes(1);

    expect(sftpClient.exists).toHaveBeenCalledTimes(1);
    expect(sftpClient.exists).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${supplierReference}/${batchId}_MANIFEST.csv`
    );

    expect(mocks.templateRepository.finaliseLock).toHaveBeenCalledTimes(1);
    expect(mocks.templateRepository.finaliseLock).toHaveBeenCalledWith(
      clientId,
      templateId
    );

    expect(sftpClient.mkdir).not.toHaveBeenCalled();
    expect(sftpClient.put).not.toHaveBeenCalled();
    expect(sftpClient.end).toHaveBeenCalledTimes(1);
  });

  test('logs handled errors', async () => {
    const { app, mocks, logMessages } = setup();

    const personalisationParameters = ['pdsField', 'custom1', 'custom2'];

    const event = mockEvent(true, personalisationParameters);

    const batchId = `${supplierReference}-0000000000000_pdfversionid`;

    const sftpClient = mock<SftpClient>();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient,
      baseDownloadDir,
      baseUploadDir,
    });

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);
    sftpClient.connect.mockResolvedValueOnce();

    const error = new Error('no PDF');

    mocks.userDataRepository.get.mockRejectedValueOnce(error);
    sftpClient.end.mockResolvedValueOnce();

    const res = await app.send(JSON.stringify(event), messageId);

    expect(res).toBe('failed');

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.userDataRepository.get).toHaveBeenCalledWith(
      clientId,
      templateId,
      pdfVersionId,
      testDataVersionId
    );

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        batchId,
        description: 'Failed to handle proofing request',
        supplierReference,
        level: 'error',
        message: error.message,
        messageId,
        pdfVersionId,
        user: { internalUserId, clientId },
      })
    );
  });

  test('logs errors if sftp connection cannot be closed', async () => {
    const { app, mocks, logMessages } = setup();

    const personalisationParameters = ['pdsField', 'custom1', 'custom2'];

    const event = mockEvent(true, personalisationParameters);

    const batchId = `${supplierReference}-0000000000000_pdfversionid`;

    const sftpClient = mock<SftpClient>();

    mocks.sftpSupplierClientRepository.getClient.mockResolvedValueOnce({
      sftpClient,
      baseDownloadDir,
      baseUploadDir,
    });

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);
    sftpClient.connect.mockResolvedValueOnce();
    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: undefined,
      pdf: Readable.from('content'),
    });
    mocks.syntheticBatch.buildBatch.mockReturnValueOnce([]);
    mocks.syntheticBatch.getHeader.mockReturnValueOnce('header');
    mocks.syntheticBatch.buildManifest.mockReturnValueOnce({
      template: supplierReference,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: 'hash-of-batch-csv',
    });
    mocks.templateRepository.acquireLockAndSetSupplierReference.mockResolvedValueOnce(
      true
    );
    sftpClient.exists.mockResolvedValueOnce(false);

    const err = new Error('sftp close err');

    sftpClient.end.mockRejectedValueOnce(err);

    const res = await app.send(JSON.stringify(event), messageId);

    expect(res).toBe('sent');

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        batchId,
        description: 'Failed to close SFTP connection',
        supplierReference,
        level: 'error',
        message: err.message,
        messageId,
        pdfVersionId,
        user: { internalUserId, clientId },
      })
    );
  });
});
