import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtPreviewSmsPage } from '../../pages/sms/template-mgmt-preview-sms-page';
import { SessionFactory } from '../../helpers/session-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const sessions = {
  empty: SessionFactory.createSmsSession('empty-sms-preview-session'),
  valid: {
    ...SessionFactory.createSmsSession('valid-sms-preview-session'),
    smsTemplateName: 'test-template-sms',
    smsTemplateMessage: 'test-template-message',
  },
};

test.describe('Preview SMS message template Page', () => {
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
    const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

    await previewSmsTemplatePage.loadPage(sessions.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-text-message-template/${sessions.valid.id}`
    );

    await expect(previewSmsTemplatePage.editRadioOption).not.toBeChecked();

    await expect(previewSmsTemplatePage.submitRadioOption).not.toBeChecked();

    await expect(previewSmsTemplatePage.pageHeader).toContainText(
      'Text message template'
    );

    await expect(previewSmsTemplatePage.pageHeader).toContainText(
      'test-template-sms'
    );

    await expect(previewSmsTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSmsPage(page),
        id: sessions.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: `templates/create-text-message-template/${sessions.valid.id}`,
      });
    });

    test('when user clicks "Who your text message will be sent from" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(sessions.valid.id);

      await previewSmsTemplatePage.whoYourSmsWillBeSentFrom.click({
        position: { x: 0, y: 0 },
      });

      await expect(
        previewSmsTemplatePage.whoYourSmsWillBeSentFrom
      ).toHaveAttribute('open');
    });

    test('when user submits form with "Edit" data, then the "Create text message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(sessions.valid.id);

      await previewSmsTemplatePage.editRadioOption.click();

      await previewSmsTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-text-message-template/${sessions.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(sessions.valid.id);

      await previewSmsTemplatePage.submitRadioOption.click();

      await previewSmsTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-text-message-template/${sessions.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(sessions.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user visits page with a fake session, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage('/fake-session-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewSmsTemplatePage = new TemplateMgmtPreviewSmsPage(page);

      await previewSmsTemplatePage.loadPage(sessions.valid.id);

      await previewSmsTemplatePage.clickSubmitButton();

      await expect(previewSmsTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink = previewSmsTemplatePage.errorSummary.locator(
        '[href="#reviewSMSTemplateAction"]'
      );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(page.locator('#reviewSMSTemplateAction')).toBeInViewport();
    });
  });
});
