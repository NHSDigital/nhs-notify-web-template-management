import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { SessionFactory } from '../helpers/session-factory';

const sessions = {
  empty: SessionFactory.createEmailSession('empty-email-session'),
  submit: SessionFactory.createEmailSession('submit-email-session'),
  submitAndReturn: SessionFactory.createEmailSession(
    'submit-and-return-session'
  ),
  goBackAndReturn: SessionFactory.createEmailSession('go-back-email-session'),
  noEmailTemplateType: SessionFactory.create({
    id: 'no-email-template-type-session',
    templateType: 'UNKNOWN',
  }),
};

test.describe('Create Email message template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper(
    Object.values(sessions)
  );

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-email-template/${sessions.empty.id}`
    );

    expect(await createEmailTemplatePage.pageHeader.textContent()).toBe(
      'Create Email message template'
    );
  });

  test.describe('Page functionality', () => {
    test('when user clicks skips to main content, then page heading is focused', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await page.keyboard.press('Tab');

      await expect(createEmailTemplatePage.skipLink).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(createEmailTemplatePage.pageHeader).toBeFocused();
    });

    test('when user clicks "notify banner link", then user is redirected to "start page"', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.clickNotifyBannerLink();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );
    });

    test(
      'when user clicks "log in", then user is redirected to "login page"',
      { tag: '@Update/CCM-4889' },
      async ({ baseURL, page }) => {
        const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

        await createEmailTemplatePage.loadPage(sessions.empty.id);

        await createEmailTemplatePage.clickLoginLink();

        await expect(page).toHaveURL(`${baseURL}/templates`);
      }
    );

    test('when user clicks go back and returns, then form fields retain previous data', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createEmailTemplatePage.nameInput.fill(
        'This is an email template name'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'This is an email template message'
      );

      await createEmailTemplatePage.goBackLink.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/choose-a-template-type/${sessions.goBackAndReturn.id}`
      );

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createEmailTemplatePage.nameInput).toHaveValue(
        'This is an email template name'
      );

      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue('');

      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        'This is an email template message'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.submit.id);

      await createEmailTemplatePage.nameInput.fill(
        'This is an email template name'
      );

      await createEmailTemplatePage.subjectLineInput.fill(
        'This is an email template subject line'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'This is an email message'
      );

      await createEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${sessions.submit.id}`
      );
    });

    test('when user submits form with valid data and returns, then form fields retain previous data', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.submitAndReturn.id);

      const templateName = 'This is an email template name';
      const templateSubjectLine = 'This is an email template subject line';
      const templateMessage = 'This is an email message';

      await createEmailTemplatePage.nameInput.fill(templateName);

      await createEmailTemplatePage.subjectLineInput.fill(templateSubjectLine);

      await createEmailTemplatePage.messageTextArea.fill(templateMessage);

      await createEmailTemplatePage.clickContinueButton();

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createEmailTemplatePage.nameInput).toHaveValue(templateName);

      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue(
        templateSubjectLine
      );

      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
    });
  });

  test.describe('Page layout', () => {
    test('should display form fields', async ({ page }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await expect(createEmailTemplatePage.nameInput).toBeVisible();
      await expect(createEmailTemplatePage.subjectLineInput).toBeVisible();
      await expect(createEmailTemplatePage.messageTextArea).toBeVisible();
      await expect(createEmailTemplatePage.continueButton).toBeVisible();
    });

    test('should display message formatting', async ({ page }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await expect(
        page.locator('h2', { hasText: 'Message formatting' })
      ).toBeVisible();
    });

    test('should display personalisation', async ({ page }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await expect(
        page.locator('h2', { hasText: 'Personalisation' })
      ).toBeVisible();
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.noEmailTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.clickContinueButton();

      await expect(createEmailTemplatePage.errorSummary).toBeVisible();

      await expect(
        createEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateName"]`
        )
      ).toBeVisible();

      await expect(
        createEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateSubjectLine"]`
        )
      ).toBeVisible();

      await expect(
        createEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateMessage"]`
        )
      ).toBeVisible();
    });

    test('when user submits form with no "Template name", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template name';

      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickContinueButton();

      const emailNameErrorLink = createEmailTemplatePage.errorSummary.locator(
        `[href="#emailTemplateName"]`
      );

      await expect(emailNameErrorLink).toHaveText(errorMessage);

      await emailNameErrorLink.click();

      await expect(createEmailTemplatePage.nameInput).toBeFocused();
    });

    test('when user submits form with no "Template Subject line", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template subject line';

      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickContinueButton();

      const emailSubjectLineErrorLink =
        createEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateSubjectLine"]'
        );

      await expect(emailSubjectLineErrorLink).toHaveText(errorMessage);

      await emailSubjectLineErrorLink.click();

      await expect(createEmailTemplatePage.subjectLineInput).toBeFocused();
    });

    test('when user submits form with no "Template message", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template message';

      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.clickContinueButton();

      const emailMessageErrorLink =
        createEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateMessage"]'
        );

      await expect(emailMessageErrorLink).toHaveText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(createEmailTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
