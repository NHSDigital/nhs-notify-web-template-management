import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../../helpers/session-storage-helper';
import { TemplateMgmtCreateNhsAppPage } from '../../pages/nhs-app/template-mgmt-create-nhs-app-page';
import { SessionFactory } from '../../helpers/session-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const sessions = {
  empty: SessionFactory.createNhsAppSession('empty-nhs-app-session'),
  submit: SessionFactory.createNhsAppSession('submit-nhs-app-session'),
  submitAndReturn: SessionFactory.createNhsAppSession(
    'submit-and-return-create-nhs-app-session'
  ),
  goBackAndReturn: SessionFactory.createNhsAppSession(
    'go-back-nhs-app-session'
  ),
  noNhsAppTemplateType: SessionFactory.create({
    id: 'no-nhs-app-template-type-session',
    templateType: 'UNKNOWN',
  }),
  previousData: {
    ...SessionFactory.createNhsAppSession('previous-data-nhs-app-session'),
    nhsAppTemplateName: 'previous-data-nhs-app-template',
    nhsAppTemplateMessage: 'previous-data-nhs-app-template-message',
  },
};

test.describe('Create NHS App template Page', () => {
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
    const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

    await createNhsAppTemplatePage.loadPage(sessions.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${sessions.empty.id}`
    );

    expect(await createNhsAppTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtCreateNhsAppPage(page),
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
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.previousData.id);

      await expect(createNhsAppTemplatePage.nameInput).toHaveValue(
        sessions.previousData.nhsAppTemplateName
      );
      await expect(createNhsAppTemplatePage.messageTextArea).toHaveValue(
        sessions.previousData.nhsAppTemplateMessage
      );
    });

    test('character count', async ({ page }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.submit.id);

      await createNhsAppTemplatePage.nameInput.fill('template-name');

      await createNhsAppTemplatePage.messageTextArea.fill('a'.repeat(100));

      await expect(createNhsAppTemplatePage.characterCountText).toHaveText(
        '100 of 5000 characters'
      );

      await createNhsAppTemplatePage.messageTextArea.fill('a'.repeat(1000));

      await expect(createNhsAppTemplatePage.characterCountText).toHaveText(
        '1000 of 5000 characters'
      );
    });

    test('when user clicks "Go back" and returns, then form fields retain previous data', async ({
      baseURL,
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createNhsAppTemplatePage.nameInput.fill(
        'This is an NHS App template name'
      );

      await createNhsAppTemplatePage.messageTextArea.fill(
        'This is an NHS App message'
      );

      await createNhsAppTemplatePage.goBackLink.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/choose-a-template-type/${sessions.goBackAndReturn.id}`
      );

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createNhsAppTemplatePage.nameInput).toHaveValue(
        'This is an NHS App template name'
      );

      await expect(createNhsAppTemplatePage.messageTextArea).toHaveValue(
        'This is an NHS App message'
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.goBackAndReturn.id);

      await createNhsAppTemplatePage.personalisationFields.click();

      await expect(
        createNhsAppTemplatePage.personalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.empty.id);

      await createNhsAppTemplatePage.messageFormatting.assertDetailsOpen([
        createNhsAppTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.empty.id);

      await createNhsAppTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(createNhsAppTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.submit.id);

      await createNhsAppTemplatePage.nameInput.fill(
        'This is an NHS App template name'
      );

      await createNhsAppTemplatePage.messageTextArea.fill(
        'This is an NHS App message'
      );

      await createNhsAppTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-nhs-app-template/${sessions.submit.id}`
      );
    });

    test('when user submits form with valid data and returns, then form fields retain previous data', async ({
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.submitAndReturn.id);

      const templateName = 'This is an NHS App template name';
      const templateMessage = 'This is an NHS App message';

      await createNhsAppTemplatePage.nameInput.fill(templateName);

      await createNhsAppTemplatePage.messageTextArea.fill(templateMessage);

      await createNhsAppTemplatePage.clickContinueButton();

      await page.getByRole('button', { name: 'Continue' }).click();

      await expect(createNhsAppTemplatePage.nameInput).toHaveValue(
        templateName
      );

      await expect(createNhsAppTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.noNhsAppTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user visits page with a fake session, then an invalid session error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage('/fake-session-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.empty.id);

      await createNhsAppTemplatePage.clickContinueButton();

      await expect(createNhsAppTemplatePage.errorSummary).toBeVisible();

      await expect(
        createNhsAppTemplatePage.errorSummary.locator('h2')
      ).toHaveText('There is a problem');

      await expect(
        createNhsAppTemplatePage.errorSummary.locator(
          `[href="#nhsAppTemplateName"]`
        )
      ).toBeVisible();

      await expect(
        createNhsAppTemplatePage.errorSummary.locator(
          `[href="#nhsAppTemplateMessage"]`
        )
      ).toBeVisible();
    });

    test('when user submits form with no "Template name", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template name';

      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.empty.id);

      await createNhsAppTemplatePage.messageTextArea.fill('template-message');

      await createNhsAppTemplatePage.clickContinueButton();

      const nhsAppNameErrorLink = createNhsAppTemplatePage.errorSummary.locator(
        `[href="#nhsAppTemplateName"]`
      );

      await expect(nhsAppNameErrorLink).toHaveText(errorMessage);

      await nhsAppNameErrorLink.click();

      await expect(createNhsAppTemplatePage.nameInput).toBeFocused();
    });

    test('when user submits form with no "Template message", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template message';

      const createNhsAppTemplatePage = new TemplateMgmtCreateNhsAppPage(page);

      await createNhsAppTemplatePage.loadPage(sessions.empty.id);

      await createNhsAppTemplatePage.nameInput.fill('template-name');

      await createNhsAppTemplatePage.clickContinueButton();

      const nhsAppMessageErrorLink =
        createNhsAppTemplatePage.errorSummary.locator(
          '[href="#nhsAppTemplateMessage"]'
        );

      await expect(nhsAppMessageErrorLink).toHaveText(errorMessage);

      await nhsAppMessageErrorLink.click();

      await expect(createNhsAppTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
