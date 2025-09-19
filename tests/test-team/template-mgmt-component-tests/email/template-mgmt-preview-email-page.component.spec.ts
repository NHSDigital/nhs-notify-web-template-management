import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewEmailPage } from '../../pages/email/template-mgmt-preview-email-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-preview-common.steps';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';

let routingEnabledUser: TestUser;

async function createTemplates() {
  const authHelper = createAuthHelper();
  const user = await authHelper.getTestUser(testUsers.User1.userId);
  routingEnabledUser = await authHelper.getTestUser(
    testUsers.RoutingEnabledUser.userId
  );

  return {
    empty: {
      id: 'c5925461-034a-460d-8170-d7388f68ed97',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'EMAIL',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    valid: {
      ...TemplateFactory.createEmailTemplate(
        '5f879439-f809-45a6-a77f-64e96bc34fc8',
        user
      ),
      name: 'valid-email-preview-template',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
    } as Template,
    routingEnabled: {
      ...TemplateFactory.createEmailTemplate(randomUUID(), routingEnabledUser),
      name: 'test-template-email',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
    } as Template,
  };
}

test.describe('Preview Email message template Page', () => {
  let templates: { empty: Template; valid: Template; routingEnabled: Template };
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();

    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewPage = new TemplateMgmtPreviewEmailPage(page);

    await previewPage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-email-template/${templates.valid.id}`
    );

    await expect(previewPage.pageHeading).toContainText(templates.valid.name);

    await expect(previewPage.subjectLineText).toHaveText(
      'test-template-subject-line'
    );

    await expect(previewPage.messageText).toHaveText('test-template-message');
  });

  test.describe('Routing feature flag enabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when user visits page, then page is loaded', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(routingEnabledUser, page);

      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.routingEnabled.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${templates.routingEnabled.id}`
      );

      await expect(previewEmailTemplatePage.continueButton).toBeHidden();

      await expect(previewEmailTemplatePage.editButton).toBeVisible();

      await previewEmailTemplatePage.editButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-email-template/${templates.routingEnabled.id}`
      );
    });
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewEmailPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });

    test('when user submits form with "Edit" data, then the "Create email message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.editRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-email-template/${templates.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.submitRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-email-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.clickContinueButton();

      await expect(previewEmailTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewEmailTemplatePage.errorSummary.locator(
          '[href="#previewEmailTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(
        page.locator('#previewEmailTemplateAction')
      ).toBeInViewport();
    });
  });
});
