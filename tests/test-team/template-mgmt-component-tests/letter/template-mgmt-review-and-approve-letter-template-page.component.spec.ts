import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { testUsers } from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtReviewAndApproveLetterTemplatePage } from '../../pages/letter/template-mgmt-review-and-approve-letter-template-page';
import { getTestContext } from '../../helpers/context/context';

async function createTemplates() {
  const context = getTestContext();
  const user = await context.auth.getTestUser(testUsers.User1.userId);

  const [globalVariant] =
    await context.letterVariants.getGlobalLetterVariants();

  return {
    valid: TemplateFactory.createAuthoringLetterTemplate(
      '95e90d9d-4efa-4dd9-a35e-40d71e8e0abb',
      user,
      'review-approve-valid',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: globalVariant.id,
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),

    validForApproval: TemplateFactory.createAuthoringLetterTemplate(
      '434bcde9-f1ae-4035-8cd8-80e4cb38756c',
      user,
      'review-approve-submit',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: globalVariant.id,
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),

    withoutLetterVariantId: TemplateFactory.createAuthoringLetterTemplate(
      '9cd300e8-4ba2-4d42-bbde-062b32ce3490',
      user,
      'review-approve-no-variant',
      'NOT_YET_SUBMITTED',
      {
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),

    nonLetterSms: {
      ...TemplateFactory.createEmailTemplate(
        '0a41e866-171b-42f4-887e-70b75db118ca',
        user
      ),
      name: 'review-approve-non-letter',
      subject: 'review-approve-non-letter',
      message: 'review-approve-non-letter',
    },

    pdfLetter: TemplateFactory.uploadPdfLetterTemplate(
      '7e8a6ac4-8562-4e27-a0a8-5f2b06f60d0f',
      user,
      'review-approve-pdf-letter'
    ),
  };
}

test.describe('Review and Approve Letter Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded with correct heading and approve button', async ({
    page,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.valid.id)
      .setSearchParam('lockNumber', String(templates.valid.lockNumber));

    await reviewPage.loadPage();

    await expect(page).toHaveURL(reviewPage.getUrl());

    await expect(reviewPage.pageHeading).toContainText(templates.valid.name);

    await expect(reviewPage.approveButton).toBeVisible();

    await expect(reviewPage.approveButton).toHaveText(
      'Approve letter template'
    );

    await expect(page.getByTestId('sheets-action')).toBeHidden();
    await expect(page.getByTestId('status-action')).toBeHidden();
  });

  test('when user clicks approve, then the template is approved and user is redirected', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.validForApproval.id)
      .setSearchParam(
        'lockNumber',
        String(templates.validForApproval.lockNumber)
      );

    await reviewPage.loadPage();

    await expect(reviewPage.approveButton).toBeVisible();

    await reviewPage.clickApproveButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/letter-template-approved/${templates.validForApproval.id}`
    );
  });

  test('redirects to preview page when lockNumber query parameter is missing', async ({
    page,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templates.valid.id);

    await reviewPage.loadPage();

    await expect(page).toHaveURL(
      `/templates/preview-letter-template/${templates.valid.id}`
    );
  });

  test('redirects to preview page when lockNumber query parameter is invalid', async ({
    page,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.valid.id)
      .setSearchParam('lockNumber', 'invalid');

    await reviewPage.loadPage();

    await expect(page).toHaveURL(
      `/templates/preview-letter-template/${templates.valid.id}`
    );
  });

  test('redirects to preview page when template has no letterVariantId', async ({
    page,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.withoutLetterVariantId.id)
      .setSearchParam(
        'lockNumber',
        String(templates.withoutLetterVariantId.lockNumber)
      );

    await reviewPage.loadPage();

    await expect(page).toHaveURL(
      `/templates/preview-letter-template/${templates.withoutLetterVariantId.id}`
    );
  });

  test('redirects to invalid-template page when template is not a letter', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.nonLetterSms.id)
      .setSearchParam('lockNumber', String(templates.nonLetterSms.lockNumber));

    await reviewPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });

  test('redirects to invalid-template page when letter has PDF letterVersion', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(page)
      .setPathParam('templateId', templates.pdfLetter.id)
      .setSearchParam('lockNumber', String(templates.pdfLetter.lockNumber));

    await reviewPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });

  test('redirects to invalid-template page when template does not exist', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', 'non-existent-template-id');

    await reviewPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
