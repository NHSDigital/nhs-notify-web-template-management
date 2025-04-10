import { mock } from 'jest-mock-extended';
import { TemplateRepository } from '../../infra/template-repository';
import { UserDataRepository } from '../../infra/user-data-repository';
import { App } from '../../app/send';
import { SyntheticBatch, Manifest } from '../../domain/synthetic-batch';
import { SftpClient } from '../../infra/sftp-client';
import { Readable } from 'node:stream';
import { mockTestDataCsv, streamToString } from '../helpers';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

const sftpEnvironment = 'nhs-notify-web-template-management-main-app-api';
const baseUploadDir = 'Incoming';
const owner = 'owner-id';
const templateId = 'template-id';
const pdfVersion = 'pdf-version-id';
const testDataVersion = 'test-data-version-id';

function setup() {
  const userDataRepository = mock<UserDataRepository>();
  const templateRepository = mock<TemplateRepository>();
  const syntheticBatch = mock<SyntheticBatch>();
  const { logger, logMessages } = createMockLogger();

  const sftpClient = mock<SftpClient>();

  const app = new App(
    userDataRepository,
    templateRepository,
    sftpEnvironment,
    syntheticBatch,
    logger
  );

  return {
    app,
    mocks: {
      userDataRepository,
      templateRepository,
      syntheticBatch,
      logger,
      sftpClient,
    },
    logMessages,
  };
}

function mockEvent(hasTestData: boolean, fields: string[]) {
  return {
    owner,
    templateId,
    pdfVersion,
    ...(hasTestData && { testDataVersion }),
    fields,
  };
}

describe('App', () => {
  test('calls dependencies to send a proofing request', async () => {
    const { app, mocks } = setup();

    const personalisationFields = ['pdsField', 'custom1', 'custom2'];
    const batchColumns = ['clientRef', 'template', ...personalisationFields];

    const event = mockEvent(true, personalisationFields);

    const pdfContent = 'mock PDF content';
    const pdf = Readable.from(pdfContent);

    const batchId = 'template-id-0000000000000_pdfversionid';

    const testData = [
      { custom1: 'short1', custom2: 'short2' },
      { custom1: 'medium1', custom2: 'medium2' },
      { custom1: 'long1', custom2: 'long2' },
    ];

    const batchData = [
      {
        clientRef: 'random1_random2_1744184100',
        template: templateId,
        pdsField: 'pdsVal1',
        custom1: 'short1',
        custom2: 'short2',
      },
      {
        clientRef: 'random3_random4_1744184100',
        template: templateId,
        pdsField: 'pdsVal2',
        custom1: 'medium1',
        custom2: 'medium2',
      },
      {
        clientRef: 'random5_random6_1744184100',
        template: templateId,
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
      template: templateId,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: batchHash,
    };

    const manifestCsv = [
      'template,batch,records,md5sum',
      `"${templateId}","${batchId}.csv","3","${batchHash}"`,
    ].join('\n');

    const testDataCsv = mockTestDataCsv(['custom1', 'custom2'], testData);

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);

    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: testDataCsv,
      pdf,
    });

    mocks.syntheticBatch.buildBatch.mockReturnValueOnce(batchData);

    mocks.syntheticBatch.getHeader.mockReturnValueOnce(batchColumns.join(','));

    mocks.syntheticBatch.buildManifest.mockReturnValueOnce(manifestData);

    // manifest doesn't already exist
    mocks.sftpClient.exists.mockResolvedValueOnce(false);

    await app.send(JSON.stringify(event), mocks.sftpClient, baseUploadDir);

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.userDataRepository.get).toHaveBeenCalledWith(
      owner,
      templateId,
      pdfVersion,
      testDataVersion
    );

    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledWith(
      templateId,
      personalisationFields,
      testData
    );

    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledWith(
      personalisationFields
    );

    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledWith(
      templateId,
      batchId,
      batchCsv
    );

    expect(mocks.sftpClient.exists).toHaveBeenCalledTimes(1);
    expect(mocks.sftpClient.exists).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}/${batchId}_MANIFEST.csv`
    );

    expect(mocks.sftpClient.mkdir).toHaveBeenCalledTimes(2);
    expect(mocks.sftpClient.mkdir).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/templates/${templateId}`,
      true
    );
    expect(mocks.sftpClient.mkdir).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}`,
      true
    );

    expect(mocks.sftpClient.put).toHaveBeenCalledTimes(3);

    const [pdfPutCall, batchPutCall, manifestPutCall] =
      mocks.sftpClient.put.mock.calls;

    const [pdfArg, pdfDestinationArg] = pdfPutCall;

    expect(await streamToString(pdfArg)).toEqual(pdfContent);
    expect(pdfDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/templates/${templateId}/${templateId}.pdf`
    );

    const [batchArg, batchDestinationArg] = batchPutCall;

    expect(await streamToString(batchArg)).toEqual(batchCsv);
    expect(batchDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}/${batchId}.csv`
    );

    const [manifestArg, manifestDestinationArg] = manifestPutCall;

    expect(await streamToString(manifestArg)).toEqual(manifestCsv);
    expect(manifestDestinationArg).toBe(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}/${batchId}_MANIFEST.csv`
    );

    expect(
      mocks.templateRepository.updateToNotYetSubmitted
    ).toHaveBeenCalledTimes(1);
    expect(
      mocks.templateRepository.updateToNotYetSubmitted
    ).toHaveBeenCalledWith(owner, templateId);
  });

  test('throws if proof request event is invalid JSON', async () => {
    const { app, mocks } = setup();

    await expect(
      app.send('notjson', mocks.sftpClient, baseUploadDir)
    ).rejects.toThrow(`Unexpected token 'o', "notjson" is not valid JSON`);
  });

  test('throws if proof request event is missing a property', async () => {
    const { app, mocks } = setup();

    const { fields: _, ...invalidEvent } = mockEvent(true, ['field']);

    await expect(
      app.send(JSON.stringify(invalidEvent), mocks.sftpClient, baseUploadDir)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('exist early and does not send if the manifest is already in the SFTP server', async () => {
    const { app, mocks, logMessages } = setup();

    const personalisationFields = ['pdsField'];
    const batchColumns = ['clientRef', 'template', ...personalisationFields];

    const event = mockEvent(true, personalisationFields);

    const pdfContent = 'mock PDF content';
    const pdf = Readable.from(pdfContent);

    const batchId = 'template-id-0000000000000_pdfversionid';

    const batchData = [
      {
        clientRef: 'random1_random2_1744184100',
        template: templateId,
        pdsField: 'pdsVal1',
      },
      {
        clientRef: 'random3_random4_1744184100',
        template: templateId,
        pdsField: 'pdsVal2',
      },
      {
        clientRef: 'random5_random6_1744184100',
        template: templateId,
        pdsField: 'pdsVal3',
      },
    ];

    const batchCsv: string = [
      batchColumns.join(','),
      batchData
        .map((x) =>
          [`"${x.clientRef}"`, `"${x.template}"`, `"${x.pdsField}"`].join(',')
        )
        .join('\n'),
    ].join('\n');

    const batchHash = 'hash-of-batch-csv';

    const manifestData: Manifest = {
      template: templateId,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: batchHash,
    };

    mocks.syntheticBatch.getId.mockReturnValueOnce(batchId);

    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: undefined,
      pdf,
    });

    mocks.syntheticBatch.buildBatch.mockReturnValueOnce(batchData);

    mocks.syntheticBatch.getHeader.mockReturnValueOnce(batchColumns.join(','));

    mocks.syntheticBatch.buildManifest.mockReturnValueOnce(manifestData);

    // manifest already exists
    mocks.sftpClient.exists.mockResolvedValueOnce('-');

    await app.send(JSON.stringify(event), mocks.sftpClient, baseUploadDir);

    expect(logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Manifest already exists, assuming duplicate event',
      })
    );

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);

    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildBatch).toHaveBeenCalledWith(
      templateId,
      personalisationFields,
      undefined
    );

    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.getHeader).toHaveBeenCalledWith(
      personalisationFields
    );

    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledTimes(1);
    expect(mocks.syntheticBatch.buildManifest).toHaveBeenCalledWith(
      templateId,
      batchId,
      batchCsv
    );

    expect(mocks.sftpClient.exists).toHaveBeenCalledTimes(1);
    expect(mocks.sftpClient.exists).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}/${batchId}_MANIFEST.csv`
    );

    expect(mocks.sftpClient.mkdir).not.toHaveBeenCalled();

    expect(mocks.sftpClient.put).not.toHaveBeenCalled();

    expect(
      mocks.templateRepository.updateToNotYetSubmitted
    ).not.toHaveBeenCalled();
  });
});
