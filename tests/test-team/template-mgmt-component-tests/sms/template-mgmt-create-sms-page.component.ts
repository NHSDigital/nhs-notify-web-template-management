import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtCreateSmsPage } from '../../pages/sms/template-mgmt-create-sms-page';
import { SessionFactory } from '../../helpers/session-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const sessions = {
  empty: SessionFactory.createSmsSession('empty-sms-session'),
  submit: SessionFactory.createSmsSession('submit-sms-session'),
  submitAndReturn: SessionFactory.createSmsSession(
    'submit-and-return-create-sms-session'
  ),
  goBackAndReturn: SessionFactory.createSmsSession('go-back-sms-session'),
  noSmsTemplateType: SessionFactory.create({
    id: 'no-sms-template-type-session',
    templateType: 'UNKNOWN',
  }),
  previousData: {
    ...SessionFactory.createSmsSession('previous-data-sms-session'),
    smsTemplateName: 'previous-data-sms-template',
    smsTemplateMessage: 'previous-data-sms-template-message',
  },
};

test.describe('Create SMS message template Page', () => {
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
    const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

    await createSmsTemplatePage.loadPage(sessions.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-text-message-template/${sessions.empty.id}`
    );

    expect(await createSmsTemplatePage.pageHeader.textContent()).toBe(
      'Create text message template'
    );

    await expect(createSmsTemplatePage.pricingLink).toHaveAttribute(
      'href',
      '/pricing/text-messages'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtCreateSmsPage(page),
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
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.previousData.id);

      await expect(createSmsTemplatePage.nameInput).toHaveValue(
        sessions.previousData.smsTemplateName
      );
      await expect(createSmsTemplatePage.messageTextArea).toHaveValue(
        sessions.previousData.smsTemplateMessage
      );
    });

    test('character count', async ({ page }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.submit.id);

      await createSmsTemplatePage.nameInput.fill('template-name');

      await createSmsTemplatePage.messageTextArea.fill('a'.repeat(100));

      await expect(createSmsTemplatePage.characterCountText).toHaveText(
        '100 characters'
      );

      await createSmsTemplatePage.messageTextArea.fill('a'.repeat(1000));

      await expect(createSmsTemplatePage.characterCountText).toHaveText(
        '918 characters'
      );
    });

    test('when user clicks "Go back" and returns, then form fields retain previous data', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createSmsTemplatePage.nameInput.fill(
        'This is an SMS template name'
      );

      await createSmsTemplatePage.messageTextArea.fill(
        'This is an SMS template message'
      );

      await createSmsTemplatePage.goBackLink.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/choose-a-template-type/${sessions.goBackAndReturn.id}`
      );

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createSmsTemplatePage.nameInput).toHaveValue(
        'This is an SMS template name'
      );

      await expect(createSmsTemplatePage.messageTextArea).toHaveValue(
        'This is an SMS template message'
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createSmsTemplatePage.personalisationFields.click();

      await expect(createSmsTemplatePage.personalisationFields).toHaveAttribute(
        'open'
      );
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.empty.id);

      await createSmsTemplatePage.messageFormatting.assertDetailsOpen([
        createSmsTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.empty.id);

      await createSmsTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(createSmsTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.submit.id);

      await createSmsTemplatePage.nameInput.fill(
        'This is an SMS template name'
      );

      await createSmsTemplatePage.messageTextArea.fill(
        'This is an SMS message'
      );

      await createSmsTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-text-message-template/${sessions.submit.id}`
      );
    });

    test('when user submits form with valid data and returns, then form fields retain previous data', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.submitAndReturn.id);

      const templateName = 'This is an SMS template name';
      const templateMessage = 'This is an SMS message';

      await createSmsTemplatePage.nameInput.fill(templateName);

      await createSmsTemplatePage.messageTextArea.fill(templateMessage);

      await createSmsTemplatePage.clickContinueButton();

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createSmsTemplatePage.nameInput).toHaveValue(templateName);

      await expect(createSmsTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.noSmsTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user visits page with a fake session, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage('/fake-session-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.empty.id);

      await createSmsTemplatePage.clickContinueButton();

      await expect(createSmsTemplatePage.errorSummary).toBeVisible();

      await expect(createSmsTemplatePage.errorSummary.locator('h2')).toHaveText(
        'There is a problem'
      );

      await expect(
        createSmsTemplatePage.errorSummary.locator(`[href="#smsTemplateName"]`)
      ).toBeVisible();

      await expect(
        createSmsTemplatePage.errorSummary.locator(
          `[href="#smsTemplateMessage"]`
        )
      ).toBeVisible();
    });

    test('when user submits form with no "Template name", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template name';

      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.empty.id);

      await createSmsTemplatePage.messageTextArea.fill('template-message');

      await createSmsTemplatePage.clickContinueButton();

      const smsNameErrorLink = createSmsTemplatePage.errorSummary.locator(
        `[href="#smsTemplateName"]`
      );

      await expect(smsNameErrorLink).toHaveText(errorMessage);

      await smsNameErrorLink.click();

      await expect(createSmsTemplatePage.nameInput).toBeFocused();
    });

    test('when user submits form with no "Template message", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template message';

      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(sessions.empty.id);

      await createSmsTemplatePage.nameInput.fill('template-name');

      await createSmsTemplatePage.clickContinueButton();

      const smsMessageErrorLink = createSmsTemplatePage.errorSummary.locator(
        '[href="#smsTemplateMessage"]'
      );

      await expect(smsMessageErrorLink).toHaveText(errorMessage);

      await smsMessageErrorLink.click();

      await expect(createSmsTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
