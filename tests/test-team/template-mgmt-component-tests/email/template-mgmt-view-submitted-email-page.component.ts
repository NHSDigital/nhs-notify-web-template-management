import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import { TemplateMgmtViewSubmittedEmailPage } from '../../pages/email/template-mgmt-view-submitted-email-page';
import { TemplateFactory } from '../../helpers/template-factory';
import { TemplateStatus } from '../../helpers/types';
import {
  assertFooterLinks,
  assertLogoutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-view-submitted-common.steps';

const templates = {
  valid: {
    ...TemplateFactory.createEmailTemplate(
      'valid-email-template-view-submitted'
    ),
    name: 'test-template-email',
    subject: 'test-template-subject-line',
    message: 'test-template-message',
    templateStatus: TemplateStatus.SUBMITTED,
  },
  invalid: {
    ...TemplateFactory.createEmailTemplate(
      'invalid-email-template-view-submitted'
    ),
    name: 'test-template-email',
    subject: 'test-template-subject-line',
    message: 'test-template-message',
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  },
};

test.describe('View submitted Email message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const viewSubmittedEmailTemplatePage =
      new TemplateMgmtViewSubmittedEmailPage(page);

    await viewSubmittedEmailTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/view-submitted-email-template/${templates.valid.id}`
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
      await assertLogoutLink(props);
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
