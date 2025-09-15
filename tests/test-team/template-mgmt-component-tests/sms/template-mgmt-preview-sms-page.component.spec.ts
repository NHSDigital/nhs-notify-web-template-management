import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSmsPage } from '../../pages/sms/template-mgmt-preview-sms-page';
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
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  return {
    empty: {
      id: 'preview-page-invalid-sms-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    valid: {
      ...TemplateFactory.createSmsTemplate('valid-sms-preview-template', user),
      name: 'test-template-sms',
      message: 'test-template-message',
    },
  };
}

test.describe('Preview SMS message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: { valid: Template; empty: Template };

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
    const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

    await previewSmsTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-text-message-template/${templates.valid.id}`
    );

    await expect(previewSmsTemplatePage.editRadioOption).not.toBeChecked();

    await expect(previewSmsTemplatePage.submitRadioOption).not.toBeChecked();

    await expect(previewSmsTemplatePage.pageHeading).toContainText(
      'test-template-sms'
    );

    await expect(previewSmsTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSmsPage(page),
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

    test('when user submits form with "Edit" data, then the "Create text message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(templates.valid.id);

      await previewSmsTemplatePage.editRadioOption.click();

      await previewSmsTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-text-message-template/${templates.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(templates.valid.id);

      await previewSmsTemplatePage.submitRadioOption.click();

      await previewSmsTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-text-message-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(templates.valid.id);

      await previewSmsTemplatePage.clickContinueButton();

      await expect(previewSmsTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink = previewSmsTemplatePage.errorSummary.locator(
        '[href="#previewSMSTemplateAction"]'
      );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(page.locator('#previewSMSTemplateAction')).toBeInViewport();
    });
  });
});
