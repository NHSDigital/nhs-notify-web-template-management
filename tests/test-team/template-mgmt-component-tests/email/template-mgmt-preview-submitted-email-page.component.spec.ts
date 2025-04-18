import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtViewSubmittedEmailPage } from '../../pages/email/template-mgmt-preview-submitted-email-page';
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
} from '../template-mgmt-view-submitted-common.steps';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    valid: {
      ...TemplateFactory.createEmailTemplate(
        'valid-email-template-view-submitted',
        owner
      ),
      name: 'test-template-email',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
      templateStatus: 'SUBMITTED',
    },
    invalid: {
      ...TemplateFactory.createEmailTemplate(
        'invalid-email-template-view-submitted',
        owner
      ),
      name: 'test-template-email',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
      templateStatus: 'NOT_YET_SUBMITTED',
    },
  };
}

test.describe('View submitted Email message template Page', () => {
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const viewSubmittedEmailTemplatePage =
      new TemplateMgmtViewSubmittedEmailPage(page);

    await viewSubmittedEmailTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-email-template/${templates.valid.id}`
    );

    await expect(viewSubmittedEmailTemplatePage.pageHeader).toContainText(
      'test-template-email'
    );

    await expect(viewSubmittedEmailTemplatePage.subjectLineText).toHaveText(
      'test-template-subject-line'
    );

    await expect(viewSubmittedEmailTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtViewSubmittedEmailPage(page),
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
      const viewSubmittedEmailTemplatePage =
        new TemplateMgmtViewSubmittedEmailPage(page);

      await viewSubmittedEmailTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const viewSubmittedEmailTemplatePage =
        new TemplateMgmtViewSubmittedEmailPage(page);

      await viewSubmittedEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
