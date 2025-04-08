import { mock } from 'jest-mock-extended';
import { TemplateRepository } from '../../infra/template-repository';
import { UserDataRepository } from '../../infra/user-data-repository';
import { App } from '../../app/send';
import { Batch } from '../../domain/batch';
import { Logger } from 'nhs-notify-web-template-management-utils';
import { SftpClient } from '../../infra/sftp-client';
import { Readable } from 'node:stream';
import { mockTestData } from '../helpers';

const sftpEnvironment = 'nhs-notify-web-template-management-main-app-api';
const baseUploadDir = 'Incoming';
const owner = 'owner-id';
const templateId = 'template-id';
const pdfVersion = 'pdf-version-id';
const testDataVersion = 'test-data-version-id';

function setup() {
  const userDataRepository = mock<UserDataRepository>();
  const templateRepository = mock<TemplateRepository>();
  const batch = mock<Batch>();
  const logger = mock<Logger>();

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

const standardFields = [
  'nhsNumber',
  'date',
  'address_line_1',
  'address_line_2',
  'address_line_3',
  'address_line_4',
  'address_line_5',
  'address_line_6',
  'address_line_7',
];

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

    const fields = [...standardFields, 'fullName', 'custom1', 'custom2'];

    const event = mockEvent(true, fields);

    const pdf = Readable.from('data');

    const testData = mockTestData(
      ['custom1', 'custom2'],
      [
        { custom1: 'short1', custom2: 'short2' },
        { custom1: 'medium1', custom2: 'medium2' },
        { custom1: 'long1', custom2: 'long2' },
      ]
    );

    mocks.userDataRepository.get.mockResolvedValueOnce({ testData, pdf });

    await app.send(JSON.stringify(event), mocks.sftpClient, baseUploadDir);

    expect(mocks.userDataRepository.get).toHaveBeenCalledTimes(1);
    expect(mocks.userDataRepository.get).toHaveBeenCalledWith(
      owner,
      templateId,
      pdfVersion,
      testDataVersion
    );

    expect(mocks.batch.buildBatch).toHaveBeenCalledTimes(1);
    expect(mocks.batch.buildBatch).toHaveBeenCalledWith(templateId, fields);
  });
});
