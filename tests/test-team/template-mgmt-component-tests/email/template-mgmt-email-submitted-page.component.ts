import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import {
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { TemplateFactory } from '../../helpers/template-factory';
import { TemplateMgmtTemplateSubmittedPage } from '../../pages/template-mgmt-template-submitted-page';

const templates = {
  valid: TemplateFactory.createEmailTemplate({
    id: 'valid-email-template',
    name: 'test-template-email',
    fields: {
      content: 'test example content',
    },
  }),
};

test.describe('Submit Email message template Page', () => {
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
    const emailTemplateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
      page
    );

    await emailTemplateSubmittedPage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/email-template-submitted/${templates.valid.id}`
    );

    await expect(emailTemplateSubmittedPage.pageHeader).toHaveText(
      'Template submitted'
    );

    await expect(emailTemplateSubmittedPage.templateNameText).toHaveText(
      templates.valid.name
    );

    await expect(emailTemplateSubmittedPage.templateIdText).toHaveText(
      templates.valid.id
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtTemplateSubmittedPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
    });

    test('when user submits clicks "Create another template", then user is redirected to "create-template"', async ({
      page,
    }) => {
      const emailTemplateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
        page
      );

      await emailTemplateSubmittedPage.loadPage(templates.valid.id);

      await emailTemplateSubmittedPage.clickCreateAnotherTemplateLink();

      await expect(page).toHaveURL(
        new RegExp('/templates/choose-a-template-type/(.*)')
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with invalid data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const emailTemplateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
        page
      );

      await emailTemplateSubmittedPage.loadPage('non-existent-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
