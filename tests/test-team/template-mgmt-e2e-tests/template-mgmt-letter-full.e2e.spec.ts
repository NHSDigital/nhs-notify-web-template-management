import { test, expect, Page } from '@playwright/test';
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
import { EmailHelper } from '../helpers/email-helper';
import { TemplateMgmtSignInPage } from '../pages/templates-mgmt-login-page';

const lambdaClient = new LambdaClient({ region: 'eu-west-2' });

const emailHelper = new EmailHelper();

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

function login(page: Page, user: TestUser) {
  return test.step('login', async () => {
    const loginPage = new TemplateMgmtSignInPage(page);

    await loginPage.loadPage();

    await loginPage.cognitoSignIn(user);

    await page.waitForURL('/templates/create-and-submit-templates');
  });
}

function create(
  page: Page,
  templateStorageHelper: TemplateStorageHelper,
  user: TestUser,
  expectedPostCreationStatus: 'NOT_YET_SUBMITTED' | 'PENDING_PROOF_REQUEST'
) {
  return test.step('upload PDF and test data, files are validated', async () => {
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
      owner: user.userId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe(expectedPostCreationStatus);
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

    return key;
  });
}

function continueAfterCreation(page: Page) {
  return test.step('progress from upload and validation success', async () => {
    const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await expect(async () => {
      await page.reload();

      await expect(previewTemplatePage.continueButton).toBeVisible();
    }).toPass({ timeout: 40_000 });

    await previewTemplatePage.clickContinueButton();
  });
}

function requestProof(
  page: Page,
  templateStorageHelper: TemplateStorageHelper,
  templateKey: { id: string; owner: string }
) {
  return test.step('request and receive proofs', async () => {
    await expect(page).toHaveURL(TemplateMgmtRequestProofPage.urlRegexp);

    const requestProofPage = new TemplateMgmtRequestProofPage(page);
    await requestProofPage.clickRequestProofButton();

    const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);
    await expect(previewTemplatePage.continueButton).toBeHidden();

    const template = await templateStorageHelper.getTemplate(templateKey);

    const batchId = `${templateKey.id}-0000000000000_${template.files?.pdfTemplate?.currentVersion.replaceAll('-', '').slice(0, 27)}`;

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
            `proofs/WTMMOCK/${template.id}/${filename}`
          )
        )
      );

      for (const [i, meta] of metadata.entries()) {
        const msg = `Proof ${proofFilenames[i]} does not exist`;
        expect(meta, msg).not.toBeNull();
      }
    }).toPass({ intervals: [1000], timeout: 40_000 });

    await expect(async () => {
      const { templateStatus } =
        await templateStorageHelper.getTemplate(templateKey);

      expect(templateStatus).toEqual('PROOF_AVAILABLE');
    }).toPass({ timeout: 60_000 });

    await expect(async () => {
      await page.reload();

      await expect(previewTemplatePage.continueButton).toBeVisible();

      const pdfHrefs = await previewTemplatePage.pdfLinks.evaluateAll(
        (anchors) => anchors.map((a) => 'href' in a && a.href)
      );

      expect(pdfHrefs.length).toBeGreaterThan(0);

      const downloadBucketMetadata = await Promise.all(
        pdfHrefs.map((href) => {
          const [, downloadBucketPath] =
            (href as string).match(
              // eslint-disable-next-line security/detect-non-literal-regexp
              new RegExp(
                `/templates/files/(${templateKey.owner}/proofs/${templateKey.id}/[^/]+)/?$`
              )
            ) ?? [];

          if (!downloadBucketPath) {
            throw new Error(
              `Could not determine bucket path based on URL: ${href}`
            );
          }

          return templateStorageHelper.getS3Metadata(
            process.env.TEMPLATES_DOWNLOAD_BUCKET_NAME,
            downloadBucketPath
          );
        })
      );

      for (const [i, entry] of downloadBucketMetadata.entries()) {
        expect(entry, JSON.stringify(pdfHrefs[i])).not.toBeNull();
      }

      await previewTemplatePage.clickContinueButton();
    }).toPass({ timeout: 60_000 });
  });
}

function submit(
  page: Page,
  templateStorageHelper: TemplateStorageHelper,
  templateKey: { id: string; owner: string }
) {
  return test.step('finalise the template', async () => {
    await expect(page).toHaveURL(TemplateMgmtSubmitLetterPage.urlRegexp);

    const submitTemplatePage = new TemplateMgmtSubmitLetterPage(page);
    await submitTemplatePage.clickSubmitTemplateButton();

    await expect(page).toHaveURL(
      TemplateMgmtTemplateSubmittedLetterPage.urlRegexp
    );

    const finalTemplate = await templateStorageHelper.getTemplate(templateKey);
    expect(finalTemplate.templateStatus).toBe('SUBMITTED');
  });
}

function checkEmail(
  templateId: string,
  testStart: Date,
  prefix: string,
  emailTitle: string
) {
  return test.step('check email', async () => {
    await expect(async () => {
      const emailContents = await emailHelper.getEmailForTemplateId(
        prefix,
        templateId,
        testStart
      );

      expect(emailContents).toContain(templateId);
      expect(emailContents).toContain('Valid Letter Template'); // template name
      expect(emailContents).toContain(emailTitle);
    }).toPass({ timeout: 60_000 });
  });
}

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
    const testStart = new Date();

    await login(page, userWithProofing);

    const templateKey = await create(
      page,
      templateStorageHelper,
      userWithProofing,
      'PENDING_PROOF_REQUEST'
    );

    await continueAfterCreation(page);

    await requestProof(page, templateStorageHelper, templateKey);

    await checkEmail(
      templateKey.id,
      testStart,
      process.env.TEST_PROOF_REQUESTED_EMAIL_PREFIX,
      'Proof Requested'
    );

    await submit(page, templateStorageHelper, templateKey);

    await checkEmail(
      templateKey.id,
      testStart,
      process.env.TEST_TEMPLATE_SUBMITTED_EMAIL_PREFIX,
      'Template Submitted'
    );
  });

  test('Full journey - user has proofing disabled', async ({ page }) => {
    await login(page, userWithoutProofing);

    const templateKey = await create(
      page,
      templateStorageHelper,
      userWithoutProofing,
      'NOT_YET_SUBMITTED'
    );

    await continueAfterCreation(page);

    await submit(page, templateStorageHelper, templateKey);
  });
});
