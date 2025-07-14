import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedSmsPage } from '../../pages/sms/template-mgmt-preview-submitted-sms-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-preview-submitted-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    valid: {
      ...TemplateFactory.createSmsTemplate(
        'valid-sms-template-preview-submitted',
        user
      ),
      name: 'test-template-sms',
      message: 'test-template-message',
      templateStatus: 'SUBMITTED',
    },
    invalid: {
      ...TemplateFactory.createSmsTemplate(
        'invalid-sms-template-preview-submitted',
        user
      ),
      name: 'test-template-sms',
      message: 'test-template-message',
      templateStatus: 'NOT_YET_SUBMITTED',
    },
  };
}

test.describe('Preview submitted sms message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewSubmittedSMSTemplatePage =
      new TemplateMgmtPreviewSubmittedSmsPage(page);

    await previewSubmittedSMSTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-text-message-template/${templates.valid.id}`
    );

    await expect(previewSubmittedSMSTemplatePage.pageHeader).toContainText(
      'test-template-sms'
    );

    await expect(previewSubmittedSMSTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedSmsPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with an unsubmitted template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedSMSTemplatePage =
        new TemplateMgmtPreviewSubmittedSmsPage(page);

      await previewSubmittedSMSTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedSMSTemplatePage =
        new TemplateMgmtPreviewSubmittedSmsPage(page);

      await previewSubmittedSMSTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
