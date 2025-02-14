import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtCreateSmsPage } from '../../pages/sms/template-mgmt-create-sms-page';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

test.describe('Create SMS message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('when user visits page, then page is loaded', async ({ page }) => {
    const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

    await createSmsTemplatePage.loadPage();

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
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: 'templates/choose-a-template-type',
      });
    });

    test('character count', async ({ page }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

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

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.personalisationFields.click();

      await expect(createSmsTemplatePage.personalisationFields).toHaveAttribute(
        'open'
      );
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.messageFormatting.assertDetailsOpen([
        createSmsTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(createSmsTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    const moreInfoLinks = [
      {
        name: 'Text message length and pricing (opens in a new tab)',
        url: 'pricing/text-messages',
      },
      {
        name: 'Sender IDs (opens in a new tab)',
        url: 'using-nhs-notify/tell-recipients-who-your-messages-are-from',
      },
      {
        name: 'Delivery times (opens in a new tab)',
        url: 'using-nhs-notify/delivery-times',
      },
    ];

    for (const { name, url } of moreInfoLinks) {
      test(`more info link: ${name}, navigates to correct page in new tab`, async ({
        page,
        baseURL,
      }) => {
        const createTemplatePage = new TemplateMgmtCreateSmsPage(page);

        await createTemplatePage.loadPage();

        const newTabPromise = page.waitForEvent('popup');

        await page.getByRole('link', { name }).click();

        const newTab = await newTabPromise;

        await expect(newTab).toHaveURL(`${baseURL}/${url}`);
      });
    }

    test('when user submits form with valid data, then the next page is displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.nameInput.fill(
        'This is an SMS template name'
      );

      await createSmsTemplatePage.messageTextArea.fill(
        'This is an SMS message'
      );

      await createSmsTemplatePage.clickSaveAndPreviewButton();

      const previewPageRegex =
        /\/templates\/preview-text-message-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/;

      // eslint-disable-next-line security/detect-non-literal-regexp
      await expect(page).toHaveURL(new RegExp(previewPageRegex));

      const previewPageParts = page.url().match(previewPageRegex);
      expect(previewPageParts?.length).toEqual(2);
      templateStorageHelper.addAdHocTemplateKey({
        id: previewPageParts![1],
        owner: user.userId,
      });
    });
  });

  test.describe('Error handling', () => {
    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.clickSaveAndPreviewButton();

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

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.messageTextArea.fill('template-message');

      await createSmsTemplatePage.clickSaveAndPreviewButton();

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

      await createSmsTemplatePage.loadPage();

      await createSmsTemplatePage.nameInput.fill('template-name');

      await createSmsTemplatePage.clickSaveAndPreviewButton();

      const smsMessageErrorLink = createSmsTemplatePage.errorSummary.locator(
        '[href="#smsTemplateMessage"]'
      );

      await expect(smsMessageErrorLink).toHaveText(errorMessage);

      await smsMessageErrorLink.click();

      await expect(createSmsTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
