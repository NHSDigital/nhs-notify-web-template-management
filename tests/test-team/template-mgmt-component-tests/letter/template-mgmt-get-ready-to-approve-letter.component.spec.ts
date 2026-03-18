import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TemplateMgmtGetReadyToApproveLetterTemplatePage } from '../../pages/template-mgmt-get-ready-to-approve-letter-template-page';
import {
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from '../../helpers/template-mgmt-common.steps';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { createAuthHelper, testUsers } from 'helpers/auth/cognito-auth-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';

const templateIds = {
  LETTER_AUTHORING: randomUUID(),
  LETTER_PDF: randomUUID(),
};

test.describe('Get ready to approve letter template page', () => {
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    await templateStorageHelper.seedTemplateData([
      TemplateFactory.uploadLetterTemplate(
        templateIds.LETTER_PDF,
        user,
        `PDF letter - ${templateIds.LETTER_PDF}`
      ),

      TemplateFactory.createAuthoringLetterTemplate(
        templateIds.LETTER_AUTHORING,
        user,
        `Authoring letter - ${templateIds.LETTER_AUTHORING}`
      ),
    ]);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('should load page', async ({ page, baseURL }) => {
    const approvePage = new TemplateMgmtGetReadyToApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templateIds.LETTER_AUTHORING);

    await approvePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/get-ready-to-approve-letter-template/${templateIds.LETTER_AUTHORING}`
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtGetReadyToApproveLetterTemplatePage(
        page
      ).setPathParam('templateId', templateIds.LETTER_AUTHORING),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
  });

  // TODO: CCM-14753 - unskip test then ticket is merged
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip('when user clicks "Continue", then user is taken to review and approve letter template page', async ({
    page,
    baseURL,
  }) => {
    const approvePage = new TemplateMgmtGetReadyToApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templateIds.LETTER_AUTHORING);

    await approvePage.loadPage();

    await approvePage.continueButton.click();

    await page.waitForURL(
      `${baseURL}/templates/review-and-approve-letter-template/${templateIds.LETTER_AUTHORING}`
    );
  });

  test('when user clicks "Go back", then user is taken to template details page', async ({
    page,
    baseURL,
  }) => {
    const approvePage = new TemplateMgmtGetReadyToApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templateIds.LETTER_AUTHORING);

    await approvePage.loadPage();

    await approvePage.backButton.click();

    await page.waitForURL(
      `${baseURL}/templates/preview-letter-template/${templateIds.LETTER_AUTHORING}`
    );
  });

  test('should not load page when template is not a letter', async ({
    page,
    baseURL,
  }) => {
    const approvePage = new TemplateMgmtGetReadyToApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', 'unknown-template-id');

    await approvePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });

  test('should not load page when template is not an authoring letter', async ({
    page,
    baseURL,
  }) => {
    const approvePage = new TemplateMgmtGetReadyToApproveLetterTemplatePage(
      page
    ).setPathParam('templateId', templateIds.LETTER_PDF);

    await approvePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
