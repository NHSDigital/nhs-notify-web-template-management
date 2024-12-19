import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import { TemplateMgmtViewSubmittedSMSPage } from '../../pages/sms/template-mgmt-view-submitted-sms-page';
import { TemplateFactory } from '../../helpers/template-factory';
import { TemplateStatus } from '../../helpers/types';
import {
  assertFooterLinks,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-view-submitted-common.steps';

const templates = {
  valid: {
    ...TemplateFactory.createSmsTemplate('valid-sms-template-view-submitted'),
    name: 'test-template-sms',
    message: 'test-template-message',
    templateStatus: TemplateStatus.SUBMITTED,
  },
  invalid: {
    ...TemplateFactory.createSmsTemplate('invalid-sms-template-view-submitted'),
    name: 'test-template-sms',
    message: 'test-template-message',
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  },
};

test.describe('View submitted sms message template Page', () => {
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
    const viewSubmittedSMSTemplatePage = new TemplateMgmtViewSubmittedSMSPage(
      page
    );

    await viewSubmittedSMSTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/view-submitted-text-message-template/${templates.valid.id}`
    );

    await expect(viewSubmittedSMSTemplatePage.pageHeader).toContainText(
      'test-template-sms'
    );

    await expect(viewSubmittedSMSTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtViewSubmittedSMSPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
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
      const viewSubmittedSMSTemplatePage = new TemplateMgmtViewSubmittedSMSPage(
        page
      );

      await viewSubmittedSMSTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const viewSubmittedSMSTemplatePage = new TemplateMgmtViewSubmittedSMSPage(
        page
      );

      await viewSubmittedSMSTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
