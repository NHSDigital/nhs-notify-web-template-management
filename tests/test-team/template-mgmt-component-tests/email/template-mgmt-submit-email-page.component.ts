import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtSubmitEmailPage } from '../../pages/email/template-mgmt-submit-email-page';
import { SessionFactory } from '../../helpers/session-factory';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';

const templateIds = new Set<string>();

const getAndStoreTemplateId = (url: string) => {
  const id = String(url.split('/').pop());
  templateIds.add(id);
  return id;
};

const fields = {
  emailTemplateName: 'test-template-email',
  emailTemplateSubjectLine: 'test-template-subject-line',
  emailTemplateMessage: 'test-template-message',
};

const sessions = {
  empty: SessionFactory.createEmailSession('empty-email-submit-session'),
  submit: {
    ...SessionFactory.createEmailSession('submit-email-submit-session'),
    ...fields,
  },
  submitAndReturn: {
    ...SessionFactory.createEmailSession('submit-and-return-email-session'),
    ...fields,
  },
  valid: {
    ...SessionFactory.createEmailSession('valid-email-submit-session'),
    ...fields,
  },
};

test.describe('Submit Email message template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper(
    Object.values(sessions)
  );

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
    await templateStorageHelper.deleteTemplates([...templateIds.values()]);
  });

  test.describe('Page functionality', () => {
    test('when user visits page, then page is loaded', async ({
      page,
      baseURL,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.valid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-email-template/${sessions.valid.id}`
      );

      await expect(submitEmailTemplatePage.pageHeader).toContainText(
        'test-template-email'
      );
    });

    test('when user clicks "skip to main content", then page heading is focused', async ({
      page,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.valid.id);

      await page.keyboard.press('Tab');

      await expect(submitEmailTemplatePage.skipLink).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(submitEmailTemplatePage.pageHeader).toBeFocused();
    });

    test('when user clicks "Notify banner link", then user is redirected to "start page"', async ({
      baseURL,
      page,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.valid.id);

      await submitEmailTemplatePage.clickNotifyBannerLink();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );
    });

    test('when user clicks "Go back", then user is redirect to "Preview email message template" page', async ({
      page,
      baseURL,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.valid.id);

      await submitEmailTemplatePage.goBackLink.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${sessions.valid.id}`
      );
    });

    test(
      'when user clicks "Log in", then user is redirected to "login page"',
      { tag: '@Update/CCM-4889' },
      async ({ baseURL, page }) => {
        const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

        await submitEmailTemplatePage.loadPage(sessions.valid.id);

        await submitEmailTemplatePage.clickLoginLink();

        await expect(page).toHaveURL(`${baseURL}/templates`);
      }
    );

    test('when user submits form with, then the "Template submitted" page is displayed', async ({
      page,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.submit.id);

      await submitEmailTemplatePage.clickSubmitTemplateButton();

      await expect(page).toHaveURL(
        new RegExp('(.*)/templates/email-template-submitted/email-(.*)')
      );

      const templateId = getAndStoreTemplateId(page.url());

      const template = await templateStorageHelper.getTemplate(templateId!);

      expect(template).toBeTruthy();
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits form and returns, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const submitEmailTemplatePage = new TemplateMgmtSubmitEmailPage(page);

      await submitEmailTemplatePage.loadPage(sessions.submitAndReturn.id);

      await submitEmailTemplatePage.clickSubmitTemplateButton();

      getAndStoreTemplateId(page.url());

      // Minor delay here to ensure session is correctly deleted
      // This test feels inherently flakey due to waiting on a session being deleted
      // 3 seconds is more than ample time to have a session deleted.
      await page.waitForTimeout(3000);

      await submitEmailTemplatePage.loadPage(sessions.submitAndReturn.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });
  });
});
