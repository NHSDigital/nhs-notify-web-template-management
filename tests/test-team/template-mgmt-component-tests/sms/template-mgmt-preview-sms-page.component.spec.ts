import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSmsPage } from '../../pages/sms/template-mgmt-preview-sms-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertBackLinkBottom,
  assertAndClickBackLinkTop,
} from '../../helpers/template-mgmt-common.steps';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../../helpers/template-mgmt-common.steps';
import { Template } from '../../helpers/types';
import { TestUser, testUsers } from '../../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../../helpers/context/context';
import { loginAsUser } from 'helpers/auth/login-as-user';

let routingDisabledUser: TestUser;
let digitalProofingUser: TestUser;

async function createTemplates() {
  const context = getTestContext();
  const user = await context.auth.getTestUser(testUsers.User1.userId);
  routingDisabledUser = await context.auth.getTestUser(testUsers.User3.userId);
  digitalProofingUser = await context.auth.getTestUser(
    testUsers.UserDigitalProofingEnabled.userId
  );

  return {
    empty: {
      id: '5ba6daa1-8da3-4477-9f59-10a50a819647',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    valid: {
      ...TemplateFactory.createSmsTemplate(
        '7f41fb5b-7f59-448c-8037-f37c25466455',
        user
      ),
      name: 'valid-sms-preview-template',
      message: 'test-template-message',
    },
    routingDisabled: {
      ...TemplateFactory.createSmsTemplate(randomUUID(), routingDisabledUser),
      name: 'test-template-sms',
      message: 'test-template-message',
    },
    digitalProofing: {
      ...TemplateFactory.createSmsTemplate(randomUUID(), digitalProofingUser),
      name: 'digital-proofing-sms-template',
      message: 'test-template-message',
    },
  };
}

test.describe('Preview SMS message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: {
    valid: Template;
    empty: Template;
    routingDisabled: Template;
    digitalProofing: Template;
  };

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await previewPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-text-message-template/${templates.valid.id}`
    );

    await expect(previewPage.pageHeading).toContainText(templates.valid.name);

    await expect(previewPage.messageText).toHaveText('test-template-message');

    await expect(previewPage.continueButton).toBeHidden();

    await expect(previewPage.editButton).toBeVisible();

    await expect(previewPage.testMessageBanner).toBeHidden();
    await expect(previewPage.sendTestMessageButton).toBeHidden();

    await expect(previewPage.editRadioOption).toBeHidden();
    await expect(previewPage.submitRadioOption).toBeHidden();
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSmsPage(page).setPathParam(
          'templateId',
          templates.valid.id
        ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkBottom({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
      await assertAndClickBackLinkTop({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
    });

    test('when user clicks "Edit template", then the "Edit SMS template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

      await previewPage.loadPage();

      await previewPage.editButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-text-message-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
        'templateId',
        templates.empty.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
        'templateId',
        'fake-template-id'
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  // This whole suite can removed once routing is permanently enabled.
  test.describe('Routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when user visits page, then page is loaded', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(routingDisabledUser, page);

      const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
        'templateId',
        templates.routingDisabled.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-text-message-template/${templates.routingDisabled.id}`
      );

      await expect(previewPage.editRadioOption).not.toBeChecked();

      await expect(previewPage.submitRadioOption).not.toBeChecked();

      await expect(previewPage.pageHeading).toContainText(
        templates.routingDisabled.name
      );

      await expect(previewPage.messageText).toHaveText('test-template-message');

      await expect(previewPage.editButton).toBeHidden();

      await expect(previewPage.sendTestMessageButton).toBeHidden();
      await expect(previewPage.testMessageBanner).toBeHidden();
    });

    test.describe('Page functionality', () => {
      test('when user submits form with "Edit" data, then the "Edit SMS template" page is displayed', async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
          'templateId',
          templates.routingDisabled.id
        );

        await previewPage.loadPage();

        await previewPage.editRadioOption.click();

        await previewPage.clickContinueButton();

        await expect(page).toHaveURL(
          `${baseURL}/templates/edit-text-message-template/${templates.routingDisabled.id}`
        );
      });

      test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
          'templateId',
          templates.routingDisabled.id
        );

        await previewPage.loadPage();

        await previewPage.submitRadioOption.click();

        await previewPage.clickContinueButton();

        await expect(page).toHaveURL(
          `${baseURL}/templates/submit-text-message-template/${templates.routingDisabled.id}?lockNumber=${templates.routingDisabled.lockNumber}`
        );
      });
    });

    test.describe('Error handling', () => {
      test('when user submits page with no data, then an error is displayed', async ({
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const errorMessage = 'Select an option';

        const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
          'templateId',
          templates.routingDisabled.id
        );

        await previewPage.loadPage();

        await previewPage.clickContinueButton();

        await expect(previewPage.errorSummary).toBeVisible();

        const selectOptionErrorLink = previewPage.errorSummary.locator(
          '[href="#previewSMSTemplateAction"]'
        );

        await expect(selectOptionErrorLink).toHaveText(errorMessage);

        await selectOptionErrorLink.click();

        await expect(
          page.locator('#previewSMSTemplateAction')
        ).toBeInViewport();
      });
    });
  });

  test.describe('Digital proofing enabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when digitalProofingSms is enabled, then banner and button are visible and both navigate correctly', async ({
      page,
      baseURL,
      context,
    }) => {
      await loginAsUser(digitalProofingUser, page);

      const previewPage = new TemplateMgmtPreviewSmsPage(page).setPathParam(
        'templateId',
        templates.digitalProofing.id
      );

      await previewPage.loadPage();

      await expect(previewPage.testMessageBanner).toBeVisible();
      await expect(previewPage.testMessageBannerLink).toHaveText(
        'Send a test text message'
      );

      await expect(previewPage.sendTestMessageButton).toBeVisible();
      await expect(previewPage.sendTestMessageButton).toHaveText(
        'Send a test message'
      );

      await expect(previewPage.editRadioOption).toBeHidden();
      await expect(previewPage.submitRadioOption).toBeHidden();
      await expect(previewPage.continueButton).toBeHidden();

      // Test banner link (opens in new tab)
      const newPagePromise = context.waitForEvent('page');
      await previewPage.testMessageBannerLink.click();
      const newPage = await newPagePromise;
      await newPage.waitForLoadState();

      await expect(newPage).toHaveURL(
        `${baseURL}/templates/send-test-text-message/${templates.digitalProofing.id}`
      );

      await newPage.close();

      // Test button (same page navigation)
      await previewPage.sendTestMessageButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/send-test-text-message/${templates.digitalProofing.id}`
      );
    });
  });
});
