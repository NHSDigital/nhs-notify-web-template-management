import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUserId,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { TemplateFactory } from '../helpers/factories/template-factory';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { SftpHelper } from '../helpers/sftp/sftp-helper';
import { SqsHelper } from '../helpers/sqs/sqs-helper';
import { parse } from 'csv-parse/sync';

const MOCK_LETTER_SUPPLIER = 'WTMMOCK';

const sqsHelper = new SqsHelper();
const sftpHelper = new SftpHelper();

function getTestDataInputFinder(testData: Record<string, string>[]) {
  return function (param: string, length: 's' | 'm' | 'l') {
    const paramRow = testData.find(
      (row) => row['Personalisation field'] === param
    );

    const lengthKey = {
      s: 'Short length data example',
      m: 'Medium length data example',
      l: 'Long length data example',
    }[length];

    const value = paramRow?.[lengthKey];
    expect(value).toBeDefined();
    return value;
  };
}

test.describe('SFTP proof send @debug', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
    await sftpHelper.end();
  });

  test('Sends PDF and test batch to SFTP, updates template', async () => {
    const templateId = randomUUID();

    const personalisationParameters = [
      'date',
      'nhsNumber',
      'fullName',
      'address_line_1',
      'address_line_2',
      'address_line_3',
      'address_line_4',
      'address_line_5',
      'address_line_6',
      'address_line_7',
      'appointment_date',
      'appointment_time',
      'appointment_location',
      'contact_telephone_number',
    ];

    const template = {
      ...TemplateFactory.createLetterTemplate(
        templateId,
        user.userId,
        'send-proof-letter',
        'PENDING_PROOF_REQUEST'
      ),
      // the template's 'personalisationParameters' has no effect on the test
      // the sender lambda does not read the template
      personalisationParameters,
    };

    const key = {
      id: templateId,
      owner: user.userId,
    };

    const pdfVersionId = template.files?.pdfTemplate?.currentVersion;
    const csvVersionId = template.files?.testDataCsv?.currentVersion;

    expect(pdfVersionId).toBeDefined();
    expect(csvVersionId).toBeDefined();

    const pdf = pdfUploadFixtures.withPersonalisation.pdf.open();
    const csv = pdfUploadFixtures.withPersonalisation.csv.open();

    await Promise.all([
      templateStorageHelper.seedTemplateData([template]),
      templateStorageHelper.putScannedPdfTemplateFile(key, pdfVersionId!, pdf),
      templateStorageHelper.putScannedCsvTestDataFile(key, csvVersionId!, csv),
    ]);

    templateStorageHelper.addAdHocTemplateKey(key);

    const proofRequest = {
      owner: key.owner,
      pdfVersionId,
      personalisationParameters,
      supplier: MOCK_LETTER_SUPPLIER,
      templateId: templateId,
      testDataVersionId: csvVersionId,
    };

    await sqsHelper.sendMessage(process.env.SEND_PROOF_QUEUE_URL, proofRequest);

    await expect(async () => {
      const updatedTemplate = await templateStorageHelper.getTemplate(key);
      const debugUpdated = JSON.stringify(updatedTemplate);

      expect(updatedTemplate.updatedAt, debugUpdated).not.toBe(
        template.updatedAt
      );
    }).toPass({ timeout: 5000 });

    const sftpCredentials = await sftpHelper.connect();

    const sftpBase = path.join(
      sftpCredentials.baseUploadDir,
      process.env.SFTP_ENVIRONMENT
    );

    const pdfLocation = path.join(
      sftpBase,
      'templates',
      templateId,
      `${templateId}.pdf`
    );

    const batchId = `${templateId}-0000000000000_${pdfVersionId!.replaceAll('-', '').slice(0, 27)}`;

    const batchLocation = path.join(
      sftpBase,
      'batches',
      templateId,
      `${batchId}.csv`
    );

    const manifestLocation = path.join(
      sftpBase,
      'batches',
      templateId,
      `${batchId}_MANIFEST.csv`
    );

    const [fetchedPdf, fetchedBatch, fetchedManifest] = await Promise.all([
      sftpHelper.get(pdfLocation),
      sftpHelper.get(batchLocation),
      sftpHelper.get(manifestLocation),
    ]);

    expect(fetchedPdf).toEqual(pdf);

    const inputCsvStrippedBom = csv.toString().replace(/^\uFEFF/, '');
    const parsedInputCsv: Record<string, string>[] = parse(
      inputCsvStrippedBom,
      {
        columns: true,
      }
    );
    const parsedBatch = parse(fetchedBatch as Buffer, { columns: true });
    const parsedManifest = parse(fetchedManifest as Buffer, { columns: true });

    // eslint-disable-next-line security/detect-unsafe-regex
    const clientRefRegex = /(?:[\dA-Za-z]{27}_){2}\d{10}/;
    const datePersonalisationRegex = /\d{1,2} [A-Za-z]+ \d{4}/;

    const inputFinder = getTestDataInputFinder(parsedInputCsv);

    expect(parsedBatch).toEqual([
      {
        template: templateId,
        clientRef: expect.stringMatching(clientRefRegex),
        date: expect.stringMatching(datePersonalisationRegex),
        appointment_date: inputFinder('appointment_date', 's'),
        appointment_location: inputFinder('appointment_location', 's'),
        appointment_time: inputFinder('appointment_time', 's'),
        contact_telephone_number: inputFinder('contact_telephone_number', 's'),
        fullName: 'MR Louie NAPIER',
        nhsNumber: '9728543751',
        address_line_1: 'MR Louie NAPIER',
        address_line_2: 'c/o Wayne Shirt (CM Test)',
        address_line_3: '6th Floor',
        address_line_4: '7&8 Wellington Place',
        address_line_5: 'Leeds',
        address_line_6: 'West Yorkshire',
        address_line_7: 'LS1 4AP',
      },
      {
        template: templateId,
        date: expect.stringMatching(datePersonalisationRegex),
        clientRef: expect.stringMatching(clientRefRegex),
        appointment_date: inputFinder('appointment_date', 'm'),
        appointment_location: inputFinder('appointment_location', 'm'),
        appointment_time: inputFinder('appointment_time', 'm'),
        contact_telephone_number: inputFinder('contact_telephone_number', 'm'),
        nhsNumber: '9728543417',
        fullName: 'MR John Barry LESTER',
        address_line_1: 'MR John Barry LESTER',
        address_line_2: '1 PAUL LANE',
        address_line_3: 'APPLEBY',
        address_line_4: 'SCUNTHORPE',
        address_line_5: 'S HUMBERSIDE',
        address_line_6: 'DN15 0AR',
        address_line_7: '',
      },
      {
        template: templateId,
        date: expect.stringMatching(datePersonalisationRegex),
        clientRef: expect.stringMatching(clientRefRegex),
        appointment_date: inputFinder('appointment_date', 'l'),
        appointment_location: inputFinder('appointment_location', 'l'),
        appointment_time: inputFinder('appointment_time', 'l'),
        contact_telephone_number: inputFinder('contact_telephone_number', 'l'),
        nhsNumber: '9464416181',
        fullName:
          'Ms AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
        address_line_1: 'Ms A A AAAAAAAAAABBBBBBBBBBDDDDDDDDDDEEEEE',
        address_line_2: '14 Dean Garden Rise',
        address_line_3: `?!""#$%&'()*+,-./0123456789`,
        address_line_4: 'HIGH WYCOMBE:;<=',
        address_line_5: 'HP11 1RE',
        address_line_6: '',
        address_line_7: '',
      },
    ]);

    // eslint-disable-next-line sonarjs/hashing
    const batchHash = createHash('md5')
      .update(fetchedBatch as Buffer)
      .digest('hex');

    expect(parsedManifest).toEqual([
      {
        template: templateId,
        batch: `${batchId}.csv`,
        records: '3',
        md5sum: batchHash,
      },
    ]);
  });
});
