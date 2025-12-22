import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../../pages/email/template-mgmt-create-email-page';
import {
  assertFooterLinks,
  assertAndClickBackLinkTop,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottomNotPresent,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

test.describe('Create Email message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/create-email-template`);

    await expect(createEmailTemplatePage.pageHeading).toHaveText(
      'Create email template'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtCreateEmailPage(page),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkBottomNotPresent(props);
      await assertAndClickBackLinkTop({
        ...props,
        expectedUrl: 'templates/choose-a-template-type',
      });
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.customPersonalisationFields.click();
      await expect(
        createEmailTemplatePage.customPersonalisationFields
      ).toHaveAttribute('open');

      await createEmailTemplatePage.pdsPersonalisationFields.click();
      await expect(
        createEmailTemplatePage.pdsPersonalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.messageFormatting.assertDetailsOpen([
        createEmailTemplatePage.messageFormatting.lineBreaksAndParagraphs,
        createEmailTemplatePage.messageFormatting.headings,
        createEmailTemplatePage.messageFormatting.bulletPoints,
        createEmailTemplatePage.messageFormatting.numberedList,
        createEmailTemplatePage.messageFormatting.horizontalLines,
        createEmailTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    const moreInfoLinks = [
      { name: 'Email messages (opens in a new tab)', url: 'features/emails' },
      {
        name: 'From and reply-to addresses (opens in a new tab)',
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
        const createTemplatePage = new TemplateMgmtCreateEmailPage(page);

        await createTemplatePage.loadPage();

        const newTabPromise = page.waitForEvent('popup');

        await page.getByRole('link', { name }).click();

        const newTab = await newTabPromise;

        await expect(newTab).toHaveURL(`${baseURL}/${url}`);
      });
    }

    const personalisationInfoLinks = [
      {
        name: 'custom personalisation fields',
        url: 'using-nhs-notify/personalisation#custom-personalisation-fields',
      },
      {
        name: 'NHS Notify API',
        url: 'using-nhs-notify/api',
      },
      {
        name: 'NHS Notify MESH',
        url: 'using-nhs-notify/mesh',
      },
    ];

    for (const { name, url } of personalisationInfoLinks) {
      test(`custom personalisation info link: ${name}, navigates to correct page in new tab`, async ({
        page,
        baseURL,
      }) => {
        const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

        await createEmailTemplatePage.loadPage();

        const newTabPromise = page.waitForEvent('popup');

        const summary = page.getByTestId(
          'custom-personalisation-fields-summary'
        );

        await summary.click();
        await expect(
          page.getByTestId('custom-personalisation-fields-text')
        ).toBeVisible();

        await page.getByRole('link', { name }).click();

        const newTab = await newTabPromise;

        await expect(newTab).toHaveURL(`${baseURL}/${url}`);
      });
    }

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });
      await expect(createEmailTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.nameInput.fill(
        'This is an email template name'
      );

      await createEmailTemplatePage.subjectLineInput.fill(
        'This is an email template subject line'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'This is an email message'
      );

      await createEmailTemplatePage.clickSaveAndPreviewButton();

      const previewPageRegex =
        /\/templates\/preview-email-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/;

      // eslint-disable-next-line security/detect-non-literal-regexp
      await expect(page).toHaveURL(new RegExp(previewPageRegex));

      const previewPageParts = page.url().match(previewPageRegex);

      expect(previewPageParts?.length).toEqual(2);

      templateStorageHelper.addAdHocTemplateKey({
        templateId: previewPageParts![1],
        clientId: user.clientId,
      });
    });
  });

  test.describe('Error handling', () => {
    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.clickSaveAndPreviewButton();

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

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickSaveAndPreviewButton();

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

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickSaveAndPreviewButton();

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

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.clickSaveAndPreviewButton();

      const emailMessageErrorLink =
        createEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateMessage"]'
        );

      await expect(emailMessageErrorLink).toHaveText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(createEmailTemplatePage.messageTextArea).toBeFocused();
    });

    test('when user submits form with an http link, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'URLs must start with https://';

      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'http://www.example.com'
      );

      await createEmailTemplatePage.clickSaveAndPreviewButton();

      const emailMessageErrorLink =
        createEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateMessage"]'
        );

      await expect(emailMessageErrorLink).toHaveText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(createEmailTemplatePage.messageTextArea).toBeFocused();
    });

    test('when user submits form with unsupported personalisation, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage =
        'You cannot use the following custom personalisation fields in your message';

      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'a template message containing ((date))'
      );

      await createEmailTemplatePage.clickSaveAndPreviewButton();

      const emailMessageErrorLink =
        createEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateMessage"]'
        );

      await expect(emailMessageErrorLink).toContainText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(createEmailTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
