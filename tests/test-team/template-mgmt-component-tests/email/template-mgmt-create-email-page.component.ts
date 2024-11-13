import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../../pages/email/template-mgmt-create-email-page';
import { SessionFactory } from '../../helpers/session-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const sessions = {
  empty: SessionFactory.createEmailSession('empty-email-session'),
  submit: SessionFactory.createEmailSession('submit-email-session'),
  submitAndReturn: SessionFactory.createEmailSession(
    'submit-and-return-create-email-session'
  ),
  goBackAndReturn: SessionFactory.createEmailSession('go-back-email-session'),
  noEmailTemplateType: SessionFactory.create({
    id: 'no-email-template-type-session',
    templateType: 'UNKNOWN',
  }),
  previousData: {
    ...SessionFactory.createEmailSession('previous-data-email-session'),
    emailTemplateName: 'previous-data-email-template',
    emailTemplateSubjectLine: 'previous-data-email-template-subject-line',
    emailTemplateMessage: 'previous-data-email-template-message',
  },
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
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtCreateEmailPage(page),
        id: sessions.empty.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: `templates/choose-a-template-type/${sessions.empty.id}`,
      });
    });

    test('when user visits page with previous data, then form fields retain previous data', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.previousData.id);

      await expect(createEmailTemplatePage.nameInput).toHaveValue(
        sessions.previousData.emailTemplateName
      );
      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue(
        sessions.previousData.emailTemplateSubjectLine
      );
      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        sessions.previousData.emailTemplateMessage
      );
    });

    test('when user clicks "Go back" and returns, then form fields retain previous data', async ({
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

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createEmailTemplatePage.personalisationFields.click();

      await expect(
        createEmailTemplatePage.personalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.messageFormatting.assertDetailsOpen([
        createEmailTemplatePage.messageFormatting.lineBreaksAndParagraphs,
        createEmailTemplatePage.messageFormatting.headings,
        createEmailTemplatePage.messageFormatting.bulletPoints,
        createEmailTemplatePage.messageFormatting.numberedList,
        createEmailTemplatePage.messageFormatting.horizontalLines,
        createEmailTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(createEmailTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
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

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.clickSubmitButton();

      await expect(createEmailTemplatePage.nameInput).toHaveValue(templateName);

      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue(
        templateSubjectLine
      );

      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
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

    test('when user visits page with a fake session, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage('/fake-session-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(sessions.empty.id);

      await createEmailTemplatePage.clickSubmitButton();

      await expect(createEmailTemplatePage.errorSummary).toBeVisible();

      await expect(
        createEmailTemplatePage.errorSummary.locator('h2')
      ).toHaveText('There is a problem');

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

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.clickSubmitButton();

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
