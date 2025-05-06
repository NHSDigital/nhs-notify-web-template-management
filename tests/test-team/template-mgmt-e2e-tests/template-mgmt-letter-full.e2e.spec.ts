import { test, expect } from '@playwright/test';
import { TemplateMgmtCreateLetterPage } from '../pages/letter/template-mgmt-create-letter-page';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  TestUserId,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { TemplateMgmtPreviewLetterPage } from '../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/template-mgmt-template-submitted-letter-page';
import { TemplateMgmtRequestProofPage } from '../pages/template-mgmt-request-proof-page';

test.describe('letter complete e2e journey', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('Full journey - template created, files scanned and validated, proof requested, template successfully submitted', async ({
    page,
  }) => {
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

      const pdf = await templateStorageHelper.getScannedPdfTemplateFile(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdf?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.pdf.checksumSha256()
      );

      const csv = await templateStorageHelper.getScannedCsvTestDataFile(
        key,
        template.files?.testDataCsv?.currentVersion as string
      );

      expect(csv?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.csv.checksumSha256()
      );

      page.reload();

      const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);
      await expect(previewTemplatePage.continueButton).toBeVisible();
      await previewTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(TemplateMgmtRequestProofPage.urlRegexp);

      const requestProofPage = new TemplateMgmtRequestProofPage(page);
      await requestProofPage.clickRequestProofButton();

      await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

      await previewTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(TemplateMgmtSubmitLetterPage.urlRegexp);

      const submitTemplatePage = new TemplateMgmtSubmitLetterPage(page);
      await submitTemplatePage.clickSubmitTemplateButton();

      await expect(page).toHaveURL(
        TemplateMgmtTemplateSubmittedLetterPage.urlRegexp
      );

      const finalTemplate = await templateStorageHelper.getTemplate(key);
      expect(finalTemplate.templateStatus).toBe('SUBMITTED');
    }).toPass({ timeout: 40_000 });
  });
});
