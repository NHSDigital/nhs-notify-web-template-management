import { test, expect } from '@playwright/test';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../pages/email/template-mgmt-create-email-page';

// TODO: session factory.
const emailErrorSession: Session = {
  __typename: 'SessionStorage',
  id: '001-email-error-session',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const emailBackSession: Session = {
  __typename: 'SessionStorage',
  id: '002-email-back-session',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const emailBackSessionWithData: Session = {
  __typename: 'SessionStorage',
  id: '003-email-back-session-with-data',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const invalidEmailSession: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const validEmailSession: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590003', // TODO: do these need to be GUUIDs?
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const validEmailSessionUserReturns: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590004', // TODO: do these need to be GUUIDs?
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test.describe('Create NHS App Template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    emailErrorSession,
    emailBackSession,
    invalidEmailSession,
    validEmailSession,
    emailBackSessionWithData,
    validEmailSessionUserReturns,
  ]);

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

    await createEmailTemplatePage.loadPage(validEmailSession.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-email-template/${validEmailSession.id}`
    );

    expect(await createEmailTemplatePage.pageHeader.textContent()).toBe(
      'Create Email message template'
    );
  });

  // TODO: is this more of an accessability test? It's functionality on this page though.
  test('when user visits page and skips to main content, then page heading is focused', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(validEmailSession.id);

    await page.keyboard.press('Tab');

    await expect(createEmailTemplatePage.skipLink).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(createEmailTemplatePage.pageHeader).toBeFocused();
  });

  // TODO: this type of logic tested in unit-tests. Should we cover this here?
  test('when user visits page with mismatched template journey, then invalid session error is displayed', async ({
    baseURL,
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(invalidEmailSession.id);

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
  });

  // TODO: is this going outside of the boundary of the test?
  test('when user clicks go back, then the previous page is displayed', async ({
    baseURL,
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(emailBackSession.id);

    await createEmailTemplatePage.goBackLink.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emailBackSession.id}`
    );
  });

  // TODO: is this going outside of the boundary of the test?
  test('when user clicks go back and returns, then form fields retain previous data', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(
      emailBackSessionWithData.id // TODO: make a new session?
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

    await createEmailTemplatePage.loadPage(emailErrorSession.id);

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

    await createEmailTemplatePage.loadPage(validEmailSession.id);

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
      `${baseURL}/templates/preview-email-template/${validEmailSession.id}`
    );
  });

  test('when user submits form with valid data and returns, then form fields retain previous data', async ({
    page,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(validEmailSessionUserReturns.id);

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
