import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedEmailPage } from '../../pages/email/template-mgmt-preview-submitted-email-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import { assertBackToAllTemplatesTopLink } from '../template-mgmt-preview-submitted-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    valid: {
      ...TemplateFactory.createEmailTemplate(
        '21f984dd-9701-466e-a166-0afeafd0a23f',
        user,
        'valid-email-template-preview-submitted'
      ),
      subject: 'test-template-subject-line',
      message: 'test-template-message',
      templateStatus: 'SUBMITTED',
    },
    invalid: {
      ...TemplateFactory.createEmailTemplate(
        '201e913d-1c21-4069-a04c-a7760b3dd602',
        user,
        'invalid-email-template-preview-submitted'
      ),
      subject: 'test-template-subject-line',
      message: 'test-template-message',
      templateStatus: 'NOT_YET_SUBMITTED',
    },
  };
}

test.describe('Preview submitted Email message template Page', () => {
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

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
    const previewSubmittedEmailTemplatePage =
      new TemplateMgmtPreviewSubmittedEmailPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

    await previewSubmittedEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-email-template/${templates.valid.id}`
    );

    await expect(previewSubmittedEmailTemplatePage.pageHeading).toContainText(
      templates.valid.name
    );

    await expect(previewSubmittedEmailTemplatePage.subjectLineText).toHaveText(
      'test-template-subject-line'
    );

    await expect(previewSubmittedEmailTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedEmailPage(page).setPathParam(
          'templateId',
          templates.valid.id
        ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackLinkBottom({
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
      const previewSubmittedEmailTemplatePage =
        new TemplateMgmtPreviewSubmittedEmailPage(page).setPathParam(
          'templateId',
          templates.invalid.id
        );

      await previewSubmittedEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedEmailTemplatePage =
        new TemplateMgmtPreviewSubmittedEmailPage(page).setPathParam(
          'templateId',
          'fake-template-id'
        );

      await previewSubmittedEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
