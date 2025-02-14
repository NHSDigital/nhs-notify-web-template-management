import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../../pages/email/template-mgmt-create-email-page';
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

test.describe('Create Email message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
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

    expect(await createEmailTemplatePage.pageHeader.textContent()).toBe(
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
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: 'templates/choose-a-template-type',
      });
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage();

      await createEmailTemplatePage.personalisationFields.click();

      await expect(
        createEmailTemplatePage.personalisationFields
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
        id: previewPageParts![1],
        owner: user.userId,
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
  });
});
