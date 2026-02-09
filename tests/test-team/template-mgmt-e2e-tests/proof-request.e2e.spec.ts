import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { pdfUploadFixtures } from '../fixtures/letters';
import { TemplateFactory } from '../helpers/factories/template-factory';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { SftpHelper } from '../helpers/sftp/sftp-helper';
import { SqsHelper } from '../helpers/sqs/sqs-helper';

const MOCK_LETTER_SUPPLIER = 'WTMMOCK';

const sqsHelper = new SqsHelper();
const sftpHelper = new SftpHelper();

test.describe('SFTP proof request send', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
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
      ...TemplateFactory.uploadLetterTemplate(
        templateId,
        user,
        'send-proof-letter',
        'PENDING_PROOF_REQUEST'
      ),
      // the template's 'personalisationParameters' have no effect on the test
      // the sender lambda does not read the template
      personalisationParameters,
      supplierReferences: {},
    };

    const key = {
      templateId,
      clientId: user.clientId,
    };

    const pdfVersionId = template.files?.pdfTemplate?.currentVersion;
    const csvVersionId = template.files?.testDataCsv?.currentVersion;

    const campaignId = user.campaignIds?.[0];

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
      campaignId,
      language: template.language,
      letterType: template.letterType,
      pdfVersionId,
      personalisationParameters,
      supplier: MOCK_LETTER_SUPPLIER,
      templateId: templateId,
      templateName: template.name,
      testDataVersionId: csvVersionId,
      user: { internalUserId: user.internalUserId, clientId: user.clientId },
    };

    await sqsHelper.sendMessage(
      process.env.REQUEST_PROOF_QUEUE_URL,
      proofRequest
    );

    await expect(async () => {
      const updatedTemplate = await templateStorageHelper.getTemplate(key);
      const debugUpdated = JSON.stringify(updatedTemplate);

      expect(
        Object.keys(updatedTemplate.supplierReferences ?? {}),
        debugUpdated
      ).toEqual([MOCK_LETTER_SUPPLIER]);
    }).toPass({ timeout: 5000 });

    const sftpCredentials = await sftpHelper.connect();

    const sftpBase = path.join(
      sftpCredentials.baseUploadDir,
      process.env.SFTP_ENVIRONMENT
    );

    const supplierReference = [
      user.clientId,
      campaignId,
      templateId,
      template.language,
      template.letterType,
    ].join('_');

    const pdfLocation = path.join(
      sftpBase,
      'templates',
      supplierReference,
      `${supplierReference}.pdf`
    );

    const batchId = `${supplierReference}-0000000000000_${pdfVersionId!.replaceAll('-', '').slice(0, 27)}`;

    const batchLocation = path.join(
      sftpBase,
      'batches',
      supplierReference,
      `${batchId}.csv`
    );

    const manifestLocation = path.join(
      sftpBase,
      'batches',
      supplierReference,
      `${batchId}_MANIFEST.csv`
    );

    await expect(async () => {
      const locations = [pdfLocation, batchLocation, manifestLocation];

      const files = await Promise.all(
        locations.map((location) => sftpHelper.stat(location))
      );

      for (const [i, file] of files.entries()) {
        const dbg = locations[i];
        expect(file.isFile, dbg).toBeTruthy();
        expect(file.size, dbg).toBeGreaterThan(0);
      }
    }).toPass({ timeout: 10_000 });
  });
});
