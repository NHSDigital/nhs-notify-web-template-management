import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtPreviewNhsAppPage } from '../../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { SessionFactory } from '../../helpers/session-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const sessions = {
  empty: SessionFactory.createNhsAppSession('empty-nhs-app-preview-session'),
  valid: {
    ...SessionFactory.createNhsAppSession('valid-nhs-app-preview-session'),
    nhsAppTemplateName: 'test-template-nhs-app',
    nhsAppTemplateMessage: 'test-template-message',
  },
};

test.describe('Preview NHS App template Page', () => {
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
    const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

    await previewNhsAppTemplatePage.loadPage(sessions.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-nhs-app-template/${sessions.valid.id}`
    );

    await expect(previewNhsAppTemplatePage.editRadioOption).not.toBeChecked();

    await expect(previewNhsAppTemplatePage.submitRadioOption).not.toBeChecked();

    await expect(previewNhsAppTemplatePage.pageHeader).toContainText(
      'NHS App message template'
    );

    await expect(previewNhsAppTemplatePage.pageHeader).toContainText(
      'test-template-nhs-app'
    );

    await expect(previewNhsAppTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewNhsAppPage(page),
        id: sessions.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: `templates/create-nhs-app-template/${sessions.valid.id}`,
      });
    });

    test('when user clicks "Who your NHS App notification will be sent from" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(sessions.valid.id);

      await previewNhsAppTemplatePage.whoYourNhsAppNotificationWillBeSentFrom.click(
        {
          position: { x: 0, y: 0 },
        }
      );

      await expect(
        previewNhsAppTemplatePage.whoYourNhsAppNotificationWillBeSentFrom
      ).toHaveAttribute('open');
    });

    test('when user submits form with "Edit" data, then the "Create NHS App message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(sessions.valid.id);

      await previewNhsAppTemplatePage.editRadioOption.click();

      await previewNhsAppTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-nhs-app-template/${sessions.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(sessions.valid.id);

      await previewNhsAppTemplatePage.submitRadioOption.click();

      await previewNhsAppTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-nhs-app-template/${sessions.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(sessions.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user visits page with a fake session, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage('/fake-session-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(sessions.valid.id);

      await previewNhsAppTemplatePage.clickContinueButton();

      await expect(previewNhsAppTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewNhsAppTemplatePage.errorSummary.locator(
          '[href="#reviewNHSAppTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(
        page.locator('#reviewNHSAppTemplateAction')
      ).toBeInViewport();
    });
  });
});
