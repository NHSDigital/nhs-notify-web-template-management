import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtReviewAndApproveLetterTemplatePage } from '../../pages/letter/template-mgmt-review-and-approve-letter-template-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  return {
    valid: TemplateFactory.createAuthoringLetterTemplate(
      'e3a1b2c3-d4e5-6f78-9a0b-c1d2e3f4a5b6',
      user,
      'review-approve-valid',
      'NOT_YET_SUBMITTED',
      {
        shortFormRender: {},
        longFormRender: {},
      }
    ),

    nonLetterSms: {
      id: 'f1a2b3c4-d5e6-7f89-0a1b-c2d3e4f5a6b7',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'review-approve-non-letter',
      message: 'test-message',
      owner: `CLIENT#${user.clientId}`,
      lockNumber: 0,
    } as Template,

    pdfLetter: TemplateFactory.uploadLetterTemplate(
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templates.valid.id);

    await reviewPage.loadPage();

    await expect(page).toHaveURL(reviewPage.getUrl());

    await expect(reviewPage.pageHeading).toContainText(templates.valid.name);

    await expect(reviewPage.approveButton).toBeVisible();

    await expect(reviewPage.approveButton).toHaveText(
      'Approve letter template'
    );
  });

  test('when user clicks approve, then the template is approved and user is redirected', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templates.valid.id);

    await reviewPage.loadPage();

    await expect(reviewPage.approveButton).toBeVisible();

    await reviewPage.clickApproveButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/letter-template-approved/${templates.valid.id}`
    );
  });

  test('redirects to invalid-template page when template is not a letter', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templates.nonLetterSms.id);

    await reviewPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });

  test('redirects to invalid-template page when letter has PDF letterVersion', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new TemplateMgmtReviewAndApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templates.pdfLetter.id);

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
