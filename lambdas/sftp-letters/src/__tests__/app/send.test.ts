import { mock } from 'jest-mock-extended';
import { TemplateRepository } from '../../infra/template-repository';
import { UserDataRepository } from '../../infra/user-data-repository';
import { App } from '../../app/send';
import { Batch } from '../../domain/batch';
import { SftpClient } from '../../infra/sftp-client';
import { Readable } from 'node:stream';
import { mockTestDataCsv } from '../helpers';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

const sftpEnvironment = 'nhs-notify-web-template-management-main-app-api';
const baseUploadDir = 'Incoming';
const owner = 'owner-id';
const templateId = 'template-id';
const pdfVersion = 'pdf-version-id';
const testDataVersion = 'test-data-version-id';

const generatedId = 'id';
const date = new Date('2025-04-09T08:48:04.805Z');

function setup() {
  const userDataRepository = mock<UserDataRepository>();
  const templateRepository = mock<TemplateRepository>();
  const batch = mock<Batch>();
  const { logger } = createMockLogger();

  const sftpClient = mock<SftpClient>();

  const app = new App(
    userDataRepository,
    templateRepository,
    sftpEnvironment,
    batch,
    logger
  );

  return {
    app,
    mocks: {
      userDataRepository,
      templateRepository,
      batch,
      logger,
      sftpClient,
    },
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

    const pdf = Readable.from('data');

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

    const batchCsv = [
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

    const testDataCsv = mockTestDataCsv(['custom1', 'custom2'], testData);

    mocks.batch.getId.mockReturnValueOnce(batchId);

    mocks.userDataRepository.get.mockResolvedValueOnce({
      testData: testDataCsv,
      pdf,
    });

    mocks.batch.buildBatch.mockReturnValueOnce(batchData);

    mocks.batch.getHeader.mockReturnValueOnce(batchColumns.join(','));

    mocks.batch.buildManifest.mockReturnValueOnce({
      template: templateId,
      batch: `${batchId}.csv`,
      records: '3',
      md5sum: 'hash-of-batch-csv',
    });

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

    expect(mocks.batch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.batch.buildBatch).toHaveBeenCalledWith(
      templateId,
      personalisationFields,
      testData
    );

    expect(mocks.batch.getHeader).toHaveBeenCalledTimes(1);
    expect(mocks.batch.getHeader).toHaveBeenCalledWith(personalisationFields);

    expect(mocks.batch.buildManifest).toHaveBeenCalledTimes(1);
    expect(mocks.batch.buildManifest).toHaveBeenCalledWith(
      templateId,
      batchId,
      batchCsv
    );

    expect(mocks.sftpClient.exists).toHaveBeenCalledTimes(1);
    expect(mocks.sftpClient.exists).toHaveBeenCalledWith(
      `${baseUploadDir}/${sftpEnvironment}/batches/${templateId}/${batchId}_MANIFEST.csv`
    );
  });
});
