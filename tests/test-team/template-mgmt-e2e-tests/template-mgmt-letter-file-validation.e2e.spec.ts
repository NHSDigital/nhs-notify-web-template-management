import { test, expect } from '@playwright/test';
import { TemplateMgmtUploadLetterPage } from '../pages/letter/template-mgmt-upload-letter-page';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { pdfUploadFixtures } from '../fixtures/pdf-upload/multipart-pdf-letter-fixtures';
import { TemplateMgmtPreviewLetterPage } from '../pages/letter/template-mgmt-preview-letter-page';

test.describe('letter file validation', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('Uploaded pdf template files and test data csv files are virus scanned - if scan passes, files are copied to the internal bucket and validated', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

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
      templateId,
      clientId: user.clientId,
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

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeHidden();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeVisible();
  });

  test('PDF only - Uploaded pdf file is virus scanned - if scan passes, file is copied to the internal bucket and validated', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('PDF Only Valid Letter Template');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.noCustomPersonalisation.pdf.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('PENDING_PROOF_REQUEST');
      expect(template.personalisationParameters).toEqual([
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
        'firstName',
        'date',
      ]);

      expect(template.testDataCsvHeaders).toEqual([]);

      const pdf = await templateStorageHelper.getScannedPdfTemplateMetadata(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdf?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.noCustomPersonalisation.pdf.checksumSha256()
      );
    }).toPass({ timeout: 40_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeHidden();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeVisible();
  });

  test('Uploaded pdf template files and test data csv files are virus scanned - if threat detected, files are deleted from quarantine and not copied, file and template status updated in database', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Antivirus test file');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdf.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csvFakeVirus.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate({
        templateId,
        clientId: user.clientId,
      });

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('FAILED');
      expect(template.templateStatus).toBe('VIRUS_SCAN_FAILED');

      const csvInternal =
        await templateStorageHelper.getScannedCsvTestDataMetadata(
          key,
          template.files?.testDataCsv?.currentVersion as string
        );

      expect(csvInternal).toBe(null);

      const csvQuarantine =
        await templateStorageHelper.getQuarantineCsvTestDataMetadata(
          key,
          template.files?.testDataCsv?.currentVersion as string
        );

      expect(csvQuarantine).toBe(null);

      const pdf = await templateStorageHelper.getScannedPdfTemplateMetadata(
        key,
        template.files?.pdfTemplate?.currentVersion as string
      );

      expect(pdf?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.pdf.checksumSha256()
      );
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('Uploaded pdf template files and test data csv files are virus scanned - if password protected, files are deleted from quarantine and not copied, file and template status updated in database', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Password protected file');

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
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('FAILED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VIRUS_SCAN_FAILED');

      const pdfInternal =
        await templateStorageHelper.getScannedPdfTemplateMetadata(
          key,
          template.files?.pdfTemplate?.currentVersion as string
        );

      expect(pdfInternal).toBe(null);

      const pdfQuarantine =
        await templateStorageHelper.getQuarantinePdfTemplateMetadata(
          key,
          template.files?.pdfTemplate?.currentVersion as string
        );

      expect(pdfQuarantine).toBe(null);

      const csv = await templateStorageHelper.getScannedCsvTestDataMetadata(
        key,
        template.files?.testDataCsv?.currentVersion as string
      );

      expect(csv?.ChecksumSHA256).toEqual(
        pdfUploadFixtures.withPersonalisation.csv.checksumSha256()
      );
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if pdf parameters and test data parameters do not match', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Wrong test data params');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdf.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csvWrongParams.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if unexpected csv is uploaded', async ({ page }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('With unexpected CSV');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.noCustomPersonalisation.pdf.filepath
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
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate({
        templateId,
        clientId: user.clientId,
      });

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if expected csv is not uploaded', async ({ page }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Missing CSV');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdf.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if pdf has incomplete address', async ({ page }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('Incomplete address');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.noCustomPersonalisation.pdfIncompleteAddress.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 40_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if pdf has empty parameters', async ({ page }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('With empty parameters');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdfEmptyParams.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csvEmptyParams.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 60_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });

  test('validation fails if pdf has non-sensible parameters', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtUploadLetterPage(page);

    await createTemplatePage.loadPage();

    await createTemplatePage.nameInput.fill('With nonsense parameters');

    await createTemplatePage.setPdfFile(
      pdfUploadFixtures.withPersonalisation.pdfNonsenseParams.filepath
    );

    await createTemplatePage.setCsvFile(
      pdfUploadFixtures.withPersonalisation.csvNonsenseParams.filepath
    );

    await createTemplatePage.clickSaveAndPreviewButton();

    await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);

    const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
      page.url()
    );

    expect(maybeTemplateId).not.toBeUndefined();

    const templateId = maybeTemplateId as string;

    const key = {
      templateId,
      clientId: user.clientId,
    };

    templateStorageHelper.addAdHocTemplateKey(key);

    await expect(async () => {
      const template = await templateStorageHelper.getTemplate(key);

      expect(template.files?.pdfTemplate?.virusScanStatus).toBe('PASSED');
      expect(template.files?.testDataCsv?.virusScanStatus).toBe('PASSED');
      expect(template.templateStatus).toBe('VALIDATION_FAILED');
      expect(template.personalisationParameters).toBeUndefined();
      expect(template.testDataCsvHeaders).toBeUndefined();
    }).toPass({ timeout: 40_000 });

    await page.reload();

    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.getByTestId('preview-letter-template-cta')).toBeHidden();
  });
});
