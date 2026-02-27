import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { testUsers } from '../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../helpers/context/context';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { pdfUploadFixtures } from '../fixtures/letters';
import { SftpHelper } from '../helpers/sftp/sftp-helper';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

const templateStorageHelper = new TemplateStorageHelper();
const context = getTestContext();
const sftpHelper = new SftpHelper();
const lambdaClient = new LambdaClient({ region: 'eu-west-2' });

test.describe('Letter Proof Polling', () => {
  test.beforeAll(async () => {
    await sftpHelper.connect();
  });

  test.afterAll(async () => {
    await sftpHelper.end();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('proofs are downloaded and linked to the DB entry', async () => {
    const templateId = '599b9a9d-17e1-4e54-bce7-645339818a1b';
    const user = await context.auth.getTestUser(testUsers.User1.userId);

    // add entries to database
    await templateStorageHelper.seedTemplateData([
      TemplateFactory.uploadLetterTemplate(
        templateId,
        user,
        'test-template-id-proofing-e2e-success',
        'WAITING_FOR_PROOF'
      ),
    ]);

    // add proofs to SFTP mock
    const pdfContent = readFileSync(
      './fixtures/letters/no-custom-personalisation/template.pdf'
    );

    const supplierReference = [
      user.clientId,
      'campaign',
      templateId,
      'en',
      'x0',
    ].join('_');

    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-1.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-2.pdf`
    );
    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof-3.pdf`
    );

    // check for expected results
    await expect(async () => {
      // invoke SFTP poll lambda
      await lambdaClient.send(
        new InvokeCommand({
          FunctionName: process.env.SFTP_POLL_LAMBDA_NAME,
          Payload: JSON.stringify({
            supplier: 'WTMMOCK',
          }),
        })
      );

      const template = await templateStorageHelper.getTemplate({
        clientId: user.clientId,
        templateId: templateId,
      });

      expect(template.files?.proofs).toEqual({
        'proof-1.pdf': {
          fileName: 'proof-1.pdf',
          supplier: 'WTMMOCK',
          virusScanStatus: 'PASSED',
        },
        'proof-2.pdf': {
          fileName: 'proof-2.pdf',
          supplier: 'WTMMOCK',
          virusScanStatus: 'PASSED',
        },
        'proof-3.pdf': {
          fileName: 'proof-3.pdf',
          supplier: 'WTMMOCK',
          virusScanStatus: 'PASSED',
        },
      });

      expect(template.templateStatus).toEqual('PROOF_AVAILABLE');

      for (const fileName of ['proof-1', 'proof-2', 'proof-3']) {
        const quarantinePdf =
          await templateStorageHelper.getLetterProofMetadata(
            process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
            'proofs',
            'WTMMOCK',
            templateId,
            fileName,
            'pdf'
          );

        expect(quarantinePdf?.ChecksumSHA256).toEqual(
          pdfUploadFixtures.noCustomPersonalisation.pdf.checksumSha256()
        );

        const internalPdf =
          await templateStorageHelper.getLetterTemplateMetadata(
            process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
            'proofs',
            { clientId: user.clientId, templateId },
            fileName,
            'pdf'
          );

        expect(internalPdf?.ChecksumSHA256).toEqual(
          pdfUploadFixtures.noCustomPersonalisation.pdf.checksumSha256()
        );

        const downloadPdf = await templateStorageHelper.getS3Metadata(
          process.env.TEMPLATES_DOWNLOAD_BUCKET_NAME,
          `${user.clientId}/proofs/${templateId}/${fileName}.pdf`
        );

        expect(downloadPdf?.ChecksumSHA256).toEqual(
          pdfUploadFixtures.noCustomPersonalisation.pdf.checksumSha256()
        );
      }
    }).toPass({ timeout: 60_000 });
  });

  test('if the only proof fails the virus scan, the status is not updated to PROOF_AVAILABLE', async () => {
    const templateId = 'a3a9c1e2-3870-407a-a8ce-af2fdcd19573';
    const user = await context.auth.getTestUser(testUsers.User1.userId);

    // add entries to database
    await templateStorageHelper.seedTemplateData([
      TemplateFactory.uploadLetterTemplate(
        templateId,
        user,
        'test-template-id-proofing-e2e-failure',
        'WAITING_FOR_PROOF'
      ),
    ]);

    // add proofs to SFTP mock
    const pdfContent = readFileSync(
      './fixtures/letters/no-custom-personalisation/password.pdf'
    );

    const supplierReference = [
      user.clientId,
      'campaign2',
      templateId,
      'fr',
      'q1',
    ].join('_');

    await sftpHelper.put(
      pdfContent,
      `WTMMOCK/Outgoing/${process.env.SFTP_ENVIRONMENT}/proofs/${supplierReference}/proof.pdf`
    );

    // invoke SFTP poll lambda
    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: process.env.SFTP_POLL_LAMBDA_NAME,
        Payload: JSON.stringify({
          supplier: 'WTMMOCK',
        }),
      })
    );

    // check for expected results
    await expect(async () => {
      const template = await templateStorageHelper.getTemplate({
        clientId: user.clientId,
        templateId,
      });

      expect(template.files?.proofs).toEqual({
        'proof.pdf': {
          fileName: `proof.pdf`,
          supplier: 'WTMMOCK',
          virusScanStatus: 'FAILED',
        },
      });

      expect(template.templateStatus).toEqual('WAITING_FOR_PROOF');

      const pdf = await templateStorageHelper.getLetterProofMetadata(
        process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
        'proofs',
        'WTMMOCK',
        templateId,
        'proof',
        'pdf'
      );

      expect(pdf).toBe(null);
    }).toPass({ timeout: 60_000 });
  });
});
