import { test, expect } from '@playwright/test';
import { TemplateMgmtCreateLetterPage } from '../pages/letter/template-mgmt-create-letter-page';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { TemplateMgmtPreviewLetterPage } from '../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/template-mgmt-template-submitted-letter-page';
import { TemplateMgmtRequestProofPage } from '../pages/template-mgmt-request-proof-page';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';

const lambdaClient = new LambdaClient({ region: 'eu-west-2' });

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('letter complete e2e journey', () => {
  const templateStorageHelper = new TemplateStorageHelper();

  let userWithProofing: TestUser;
  let userWithoutProofing: TestUser;

  test.beforeAll(async () => {
    userWithProofing = await createAuthHelper().getTestUser(
      testUsers.User1.userId
    );
    userWithoutProofing = await createAuthHelper().getTestUser(
      testUsers.User3.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('Full journey - template created, files scanned and validated, proof requested, template successfully submitted', async ({
    page,
  }) => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(userWithProofing);

    await page.waitForURL('/templates/create-and-submit-templates');

    const createTemplatePage = new TemplateMgmtCreateLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Valid Letter Template');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdf.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csv.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      id: templateId,
      owner: userWithProofing.userId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('PENDING_PROOF_REQUEST');
      expect(template.personalisationParameters).toEqual([
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
        'date',
        'nhsNumber',
        'fullName',
        'appointment_date',
        'appointment_time',
        'appointment_location',
        'contact_telephone_number',
      ]);

      expect(template.testDataCsvHeaders).toEqual([
        'appointment_date',
        'appointment_time',
        'appointment_location',
        'contact_telephone_number',
      ]);

      const pdf = await templateStorageHelper.getScannedPdfTemplateMetadata(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdf?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.pdf.checksumSha256()
      );

      const csv = await templateStorageHelper.getScannedCsvTestDataMetadata(
        key,
        template.files?.testDataCsv?.currentVersion as string
      );

      expect(csv?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.csv.checksumSha256()
      );
    }).toPass({ timeout: 40_000 });

    await expect(async () => {
      await page.reload();

      const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
      await expect(previewTemplatePage.continueButton).toBeVisible();
    }).toPass({ timeout: 40_000 });

    const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
    await previewTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(TemplateMgmtRequestProofPage.urlRegexp);

    const requestProofPage = new TemplateMgmtRequestProofPage(page);
    await requestProofPage.clickRequestProofButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);
    await expect(previewTemplatePage.continueButton).toBeHidden();

    const template = await templateStorageHelper.getTemplate(key);

    const batchId = `${key.id}-0000000000000_${template.files?.pdfTemplate?.currentVersion.replaceAll('-', '').slice(0, 27)}`;

    const proofFilenames = Array.from(
      { length: 3 },
      (_, i) => `${batchId}_proof_${i + 1}.pdf`
    );

    await expect(async () => {
      await lambdaClient.send(
        new InvokeCommand({
          FunctionName: process.env.SFTP_POLL_LAMBDA_NAME,
          Payload: JSON.stringify({
            supplier: 'WTMMOCK',
          }),
        })
      );

      const metadata = await Promise.all(
        proofFilenames.map((filename) =>
          templateStorageHelper.getS3Metadata(
            process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
            `proofs/${template.id}/${filename}`
          )
        )
      );

      for (const [i, meta] of metadata.entries()) {
        const msg = `Proof ${proofFilenames[i]} does not exist`;
        expect(meta, msg).not.toBeNull();
      }
    }).toPass({ intervals: [1000], timeout: 40_000 });

    await expect(async () => {
      const { templateStatus } = await templateStorageHelper.getTemplate(key);

      expect(templateStatus).toEqual('PROOF_AVAILABLE');
    }).toPass({ timeout: 60_000 });

    await expect(async () => {
      await page.reload();

      await expect(previewTemplatePage.continueButton).toBeVisible();

      const pdfHrefs = await previewTemplatePage.pdfLinks.evaluateAll(
        (anchors) => anchors.map((a) => 'href' in a && a.href)
      );

      expect(pdfHrefs.length).toBeGreaterThan(0);

      for (const href of pdfHrefs) expect(href).toContain(templateId);

      await previewTemplatePage.clickContinueButton();
    }).toPass({ timeout: 60_000 });

    await expect(page).toHaveURL(TemplateMgmtSubmitLetterPage.urlRegexp);

    const submitTemplatePage = new TemplateMgmtSubmitLetterPage(page);
    await submitTemplatePage.clickSubmitTemplateButton();

    await expect(page).toHaveURL(
      TemplateMgmtTemplateSubmittedLetterPage.urlRegexp
    );

    const finalTemplate = await templateStorageHelper.getTemplate(key);
    expect(finalTemplate.templateStatus).toBe('SUBMITTED');
  });

  test('Full journey - user has proofing disabled', async ({ page }) => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(userWithoutProofing);

    await page.waitForURL('/templates/create-and-submit-templates');

    const createTemplatePage = new TemplateMgmtCreateLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Valid Letter Template');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdf.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csv.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      id: templateId,
      owner: userWithoutProofing.userId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('NOT_YET_SUBMITTED');
      expect(template.personalisationParameters).toEqual([
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
        'date',
        'nhsNumber',
        'fullName',
        'appointment_date',
        'appointment_time',
        'appointment_location',
        'contact_telephone_number',
      ]);

      expect(template.testDataCsvHeaders).toEqual([
        'appointment_date',
        'appointment_time',
        'appointment_location',
        'contact_telephone_number',
      ]);

      const pdf = await templateStorageHelper.getScannedPdfTemplateMetadata(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdf?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.pdf.checksumSha256()
      );

      const csv = await templateStorageHelper.getScannedCsvTestDataMetadata(
        key,
        template.files?.testDataCsv?.currentVersion as string
      );

      expect(csv?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.csv.checksumSha256()
      );
    }).toPass({ timeout: 40_000 });

    await expect(async () => {
      await page.reload();

      const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
      await expect(previewTemplatePage.continueButton).toBeVisible();
    }).toPass({ timeout: 40_000 });

    const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
    await previewTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(TemplateMgmtSubmitLetterPage.urlRegexp);

    const submitTemplatePage = new TemplateMgmtSubmitLetterPage(page);
    await submitTemplatePage.clickSubmitTemplateButton();

    await expect(page).toHaveURL(
      TemplateMgmtTemplateSubmittedLetterPage.urlRegexp
    );

    const finalTemplate = await templateStorageHelper.getTemplate(key);
    expect(finalTemplate.templateStatus).toBe('SUBMITTED');
  });
});
