import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedSmsPage } from '../../pages/sms/template-mgmt-preview-submitted-sms-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
  assertAndClickBackLinkTop,
} from '../../helpers/template-mgmt-common.steps';
import { TestUser, testUsers } from '../../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../../helpers/context/context';

function createTemplates(user: TestUser) {
  return {
    valid: {
      ...TemplateFactory.createSmsTemplate(
        '58d0e11e-851f-4beb-ac7f-3daa3d671902',
        user
      ),
      name: 'valid-sms-template-preview-submitted',
      message: 'test-template-message',
      templateStatus: 'SUBMITTED',
    },
    invalid: {
      ...TemplateFactory.createSmsTemplate(
        '6c6d70df-0cd9-40c4-9639-1b65874bb8e1',
        user
      ),
      name: 'invalid-sms-template-preview-submitted',
      message: 'test-template-message',
      templateStatus: 'NOT_YET_SUBMITTED',
    },
  };
}

test.describe('Preview submitted sms message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const context = getTestContext();
    const user = await context.auth.getTestUser(testUsers.User1.userId);
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
      new TemplateMgmtPreviewSubmittedSmsPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

    await previewSubmittedSMSTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-text-message-template/${templates.valid.id}`
    );

    await expect(previewSubmittedSMSTemplatePage.pageHeading).toContainText(
      templates.valid.name
    );

    await expect(previewSubmittedSMSTemplatePage.messageText).toHaveText(
      'test-template-message'
    );

    await expect(previewSubmittedSMSTemplatePage.statusTag).toHaveText(
      'Locked'
    );

    await expect(previewSubmittedSMSTemplatePage.copyLink).toHaveAttribute(
      'href',
      `/templates/copy-template/${templates.valid.id}`
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedSmsPage(page).setPathParam(
          'templateId',
          templates.valid.id
        ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkBottom({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
      await assertAndClickBackLinkTop({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with an unsubmitted template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedSMSTemplatePage =
        new TemplateMgmtPreviewSubmittedSmsPage(page).setPathParam(
          'templateId',
          templates.invalid.id
        );

      await previewSubmittedSMSTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedSMSTemplatePage =
        new TemplateMgmtPreviewSubmittedSmsPage(page).setPathParam(
          'templateId',
          'fake-template-id'
        );

      await previewSubmittedSMSTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
