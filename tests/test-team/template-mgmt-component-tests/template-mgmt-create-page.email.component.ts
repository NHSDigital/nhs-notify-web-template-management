import { test, expect } from '@playwright/test';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';
import { SessionFactory } from '../helpers/session-factory';

// TODO: do I really need this many different sessions?
const sessions: Record<string, Session> = {
  emailErrorSession: SessionFactory.createEmailSession(
    '001-email-error-session'
  ),
  emailBackSession: SessionFactory.createEmailSession('002-email-back-session'),
  emailBackSessionWithData: SessionFactory.createEmailSession(
    '003-email-back-session-with-data'
  ),
  validEmailSession: SessionFactory.createEmailSession(
    '004-valid-email-session'
  ),
  validEmailSessionUserReturns: SessionFactory.createEmailSession(
    '005-valid-email-session-user-returns'
  ),
  invalidEmailSession: SessionFactory.create({
    id: '006-invalid-email-session',
    templateType: TemplateType.NHS_APP,
  }),
  invalidEmailSessionUserReturns: SessionFactory.createEmailSession(
    '007-invalid-email-session-user-returns'
  ),
};

test.describe('Create NHS App Template Page', () => {
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

    await createEmailTemplatePage.loadPage(sessions.validEmailSession.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-email-template/${sessions.validEmailSession.id}`
    );

    expect(await createEmailTemplatePage.pageHeader.textContent()).toBe(
      'Create Email message template'
    );
  });

  // TODO: this type of logic tested in unit-tests. Should we cover this here?
  test('when user visits page with mismatched template journey, then invalid session error is displayed', async ({
    baseURL,
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.invalidEmailSession.id);

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
  });

  // TODO: is this more of an accessability test? It's functionality on this page though.
  test('when user clicks skips to main content, then page heading is focused', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.validEmailSession.id);

    await page.keyboard.press('Tab');

    await expect(createEmailTemplatePage.skipLink).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(createEmailTemplatePage.pageHeader).toBeFocused();
  });

  // TODO: is this going outside of the boundary of the test?
  test('when user clicks go back, then the previous page is displayed', async ({
    baseURL,
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.emailBackSession.id);

    await createEmailTemplatePage.goBackLink.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${sessions.emailBackSession.id}`
    );
  });

  // TODO: is this going outside of the boundary of the test?
  test('when user clicks go back and returns, then form fields retain previous data', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(
      sessions.emailBackSessionWithData.id // TODO: make a new session?
    );

    await createEmailTemplatePage.nameInput.fill(
      'This is an email template name'
    );

    await createEmailTemplatePage.messageTextArea.fill(
      'This is an email template message'
    );

    await createEmailTemplatePage.goBackLink.click();

    // TODO: this is clicking the continue page on the previous page...
    // I've tried using page.goForward()... figure this out.
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(createEmailTemplatePage.nameInput).toHaveValue(
      'This is an email template name'
    );

    await expect(createEmailTemplatePage.subjectLineInput).toHaveValue('');

    await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
      'This is an email template message'
    );
  });

  // TODO: is this test doing too much? Page validation AND that the links work? Should it be broken down into
  // individual tests?
  test('when user submits form with no data, then errors are displayed', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.emailErrorSession.id);

    createEmailTemplatePage.clickContinueButton();

    const errorSummary = page.locator('[class="nhsuk-error-summary"]');

    await expect(errorSummary).toBeVisible();

    // Name
    const emailNameErrorLink = errorSummary.locator(
      `[href="#emailTemplateName"]`
    );

    await emailNameErrorLink.click();

    await expect(createEmailTemplatePage.nameInput).toBeFocused();

    // Subject line
    const emailSubjectLineErrorLink = errorSummary.locator(
      '[href="#emailTemplateSubjectLine"]'
    );

    await emailSubjectLineErrorLink.click();

    await expect(createEmailTemplatePage.subjectLineInput).toBeFocused();

    // Message
    const emailMessageErrorLink = errorSummary.locator(
      '[href="#emailTemplateMessage"]'
    );

    await emailMessageErrorLink.click();

    await expect(createEmailTemplatePage.messageTextArea).toBeFocused();
  });

  test('when user submits form with valid data, then the next page is displayed', async ({
    baseURL,
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(sessions.validEmailSession.id);

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
      `${baseURL}/templates/preview-email-template/${sessions.validEmailSession.id}`
    );
  });

  test('when user submits form with valid data and returns, then form fields retain previous data', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(
      sessions.validEmailSessionUserReturns.id
    );

    const templateName = 'This is an email template name';
    const templateSubjectLine = 'This is an email template subject line';
    const templateMessage = 'This is an email message';

    await createEmailTemplatePage.nameInput.fill(templateName);

    await createEmailTemplatePage.subjectLineInput.fill(templateSubjectLine);

    await createEmailTemplatePage.messageTextArea.fill(templateMessage);

    await createEmailTemplatePage.clickContinueButton();

    // TODO: this is clicking the continue page on the previous page...
    // I've tried using page.goForward()... figure this out.
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
