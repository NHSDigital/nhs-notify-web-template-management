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

test.describe('letter file validation', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('Uploaded pdf template files and test data csv files are virus scanned - if scan passes, files are copied to the internal bucket and the file status updated in database', async ({
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
      expect(template.templateStatus).toBe('PENDING_VALIDATION');

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
    }).toPass({ timeout: 20_000 });
  });

  test('Uploaded pdf template files and test data csv files are virus scanned - if scan fails, files are deleted from quarantine and not copied, file and template status updated in database', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtCreateLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Valid Letter Template');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.passwordPdf.filepath
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

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('FAILED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VIRUS_SCAN_FAILED');

      const pdfInternal = await templateStorageHelper.getScannedPdfTemplateFile(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdfInternal).toBe(null);

      const pdfQuarantine =
        await templateStorageHelper.getQuarantinePdfTemplateFile(
          key,
          template.files?.pdfTemplate?.currentVersion as string
        );

      expect(pdfQuarantine).toBe(null);

      const csv = await templateStorageHelper.getScannedCsvTestDataFile(
        key,
        template.files?.testDataCsv?.currentVersion as string
      );

      expect(csv?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.csv.checksumSha256()
      );
    }).toPass({ timeout: 20_000 });
  });
});
