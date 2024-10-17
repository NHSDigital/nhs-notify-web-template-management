import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtPreviewEmailPage } from '../../pages/email/template-mgmt-preview-email-page';
import { SessionFactory } from '../../helpers/session-factory';

const sessions = {
  empty: SessionFactory.createEmailSession('empty-email-preview-session'),
  valid: {
    ...SessionFactory.createEmailSession('valid-email-preview-session'),
    emailTemplateName: 'test-template-email',
    emailTemplateSubjectLine: 'test-template-subject-line',
    emailTemplateMessage: 'test-template-message',
  },
};

test.describe('Preview Email message template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper(
    Object.values(sessions)
  );

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });

  test.describe('Page functionality', () => {
    test('when user visits page, then page is loaded', async ({
      page,
      baseURL,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${sessions.valid.id}`
      );

      // Note; I've broken this check into 2 pieces otherwise it's an unreadable mess of;
      // `Email templatetest-template-email`
      await expect(previewEmailTemplatePage.pageHeader).toContainText(
        'Email template'
      );

      await expect(previewEmailTemplatePage.pageHeader).toContainText(
        'test-template-email'
      );

      await expect(previewEmailTemplatePage.subjectLineText).toHaveText(
        'test-template-subject-line'
      );

      await expect(previewEmailTemplatePage.messageText).toHaveText(
        'test-template-message'
      );
    });

    test('when user clicks "skip to main content", then page heading is focused', async ({
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await page.keyboard.press('Tab');

      await expect(previewEmailTemplatePage.skipLink).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(previewEmailTemplatePage.pageHeader).toBeFocused();
    });

    test('when user clicks "Notify banner link", then user is redirected to "start page"', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await previewEmailTemplatePage.clickNotifyBannerLink();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );
    });

    test('when user clicks "Go back", then user is redirect to "Create email message template" page', async ({
      page,
      baseURL,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await previewEmailTemplatePage.goBackLink.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-email-template/${sessions.valid.id}`
      );
    });

    test(
      'when user clicks "Log in", then user is redirected to "login page"',
      { tag: '@Update/CCM-4889' },
      async ({ baseURL, page }) => {
        const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

        await previewEmailTemplatePage.loadPage(sessions.valid.id);

        await previewEmailTemplatePage.clickLoginLink();

        await expect(page).toHaveURL(`${baseURL}/templates`);
      }
    );

    test('when user submits form with "Edit" data, then the "Create email message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await previewEmailTemplatePage.editRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-email-template/${sessions.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await previewEmailTemplatePage.submitRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-email-template/${sessions.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(sessions.valid.id);

      await previewEmailTemplatePage.clickContinueButton();

      await expect(previewEmailTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewEmailTemplatePage.errorSummary.locator(
          '[href="#reviewEmailTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(page.locator('#reviewEmailTemplateAction')).toBeInViewport();
    });
  });
});
