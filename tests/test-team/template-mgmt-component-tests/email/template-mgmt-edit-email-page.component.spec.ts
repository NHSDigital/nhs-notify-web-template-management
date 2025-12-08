import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtEditEmailPage } from '../../pages/email/template-mgmt-edit-email-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertBackLinkTopNotPresent,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    valid: TemplateFactory.createEmailTemplate(
      'f26a6c9b-29f5-4280-9b8d-aa692f0aa8aa',
      user,
      'edit-email-page-valid'
    ),
    submit: TemplateFactory.createEmailTemplate(
      '29252087-fbfa-459d-9c05-577223a94ad9',
      user,
      'edit-email-page-submit'
    ),
    submitAndReturn: TemplateFactory.createEmailTemplate(
      '2965e999-27d9-48a6-9bed-251c141ce778',
      user,
      'edit-email-page-submit-and-return'
    ),
    goBackAndReturn: TemplateFactory.createEmailTemplate(
      '66e0051e-c201-4ec7-a318-999b4c63d3b9',
      user,
      'edit-email-page-go-back-and-return'
    ),
    noEmailTemplateType: TemplateFactory.create({
      id: 'e61c935f-d4ef-4bd7-b09e-3cdc6cb5923f',
      templateType: 'NHS_APP',
      name: 'no-email-template-type-template',
      message: 'no-email-template-type-template-message',
      owner: `CLIENT#${user.clientId}`,
      clientId: user.clientId,
    }),
    previousData: {
      ...TemplateFactory.createEmailTemplate(
        'c6973bf3-6e56-46b3-9b75-fbfddf746b2f',
        user
      ),
      name: 'previous-data-email-template',
      subject: 'previous-data-email-template-subject-line',
      message: 'previous-data-email-template-message',
    },
  };
}

test.describe('Edit Email message template Page', () => {
  let templates: ReturnType<typeof createTemplates>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

    await editEmailTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-email-template/${templates.valid.id}`
    );

    await expect(editEmailTemplatePage.pageHeading).toHaveText(
      'Edit email template'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtEditEmailPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkTopNotPresent(props);
    });

    test('when user visits page with previous data, then form fields retain previous data', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.previousData.id);

      await expect(editEmailTemplatePage.nameInput).toHaveValue(
        templates.previousData.name
      );
      await expect(editEmailTemplatePage.subjectLineInput).toHaveValue(
        templates.previousData.subject
      );
      await expect(editEmailTemplatePage.messageTextArea).toHaveValue(
        templates.previousData.message
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.goBackAndReturn.id);

      await editEmailTemplatePage.customPersonalisationFields.click();
      await expect(
        editEmailTemplatePage.customPersonalisationFields
      ).toHaveAttribute('open');

      await editEmailTemplatePage.pdsPersonalisationFields.click();
      await expect(
        editEmailTemplatePage.pdsPersonalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.messageFormatting.assertDetailsOpen([
        editEmailTemplatePage.messageFormatting.lineBreaksAndParagraphs,
        editEmailTemplatePage.messageFormatting.headings,
        editEmailTemplatePage.messageFormatting.bulletPoints,
        editEmailTemplatePage.messageFormatting.numberedList,
        editEmailTemplatePage.messageFormatting.horizontalLines,
        editEmailTemplatePage.messageFormatting.linksAndUrls,
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
        const editTemplatePage = new TemplateMgmtEditEmailPage(page);
        await editTemplatePage.loadPage(templates.valid.id);
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
        const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

        await editEmailTemplatePage.loadPage(templates.goBackAndReturn.id);

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
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });
      await expect(editEmailTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.submit.id);

      await editEmailTemplatePage.nameInput.fill(
        'This is an email template name'
      );

      await editEmailTemplatePage.subjectLineInput.fill(
        'This is an email template subject line'
      );

      await editEmailTemplatePage.messageTextArea.fill(
        'This is an email message'
      );

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${templates.submit.id}?from=edit`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.noEmailTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.nameInput.fill('');

      await editEmailTemplatePage.subjectLineInput.fill('');

      await editEmailTemplatePage.messageTextArea.fill('');

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      await expect(editEmailTemplatePage.errorSummary).toBeVisible();

      await expect(editEmailTemplatePage.errorSummary.locator('h2')).toHaveText(
        'There is a problem'
      );

      await expect(
        editEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateName"]`
        )
      ).toBeVisible();

      await expect(
        editEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateSubjectLine"]`
        )
      ).toBeVisible();

      await expect(
        editEmailTemplatePage.errorSummary.locator(
          `[href="#emailTemplateMessage"]`
        )
      ).toBeVisible();
    });

    test('when user submits form with no "Template name", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template name';

      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.nameInput.fill('');

      await editEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await editEmailTemplatePage.messageTextArea.fill('template-message');

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      const emailNameErrorLink = editEmailTemplatePage.errorSummary.locator(
        `[href="#emailTemplateName"]`
      );

      await expect(emailNameErrorLink).toHaveText(errorMessage);

      await emailNameErrorLink.click();

      await expect(editEmailTemplatePage.nameInput).toBeFocused();
    });

    test('when user submits form with no "Template Subject line", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template subject line';

      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.nameInput.fill('template-name');

      await editEmailTemplatePage.subjectLineInput.fill('');

      await editEmailTemplatePage.messageTextArea.fill('template-message');

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      const emailSubjectLineErrorLink =
        editEmailTemplatePage.errorSummary.locator(
          '[href="#emailTemplateSubjectLine"]'
        );

      await expect(emailSubjectLineErrorLink).toHaveText(errorMessage);

      await emailSubjectLineErrorLink.click();

      await expect(editEmailTemplatePage.subjectLineInput).toBeFocused();
    });

    test('when user submits form with no "Template message", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template message';

      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.valid.id);

      await editEmailTemplatePage.nameInput.fill('template-name');

      await editEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await editEmailTemplatePage.messageTextArea.fill('');

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      const emailMessageErrorLink = editEmailTemplatePage.errorSummary.locator(
        '[href="#emailTemplateMessage"]'
      );

      await expect(emailMessageErrorLink).toHaveText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(editEmailTemplatePage.messageTextArea).toBeFocused();
    });

    test('when user submits form with an http link, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'URLs must start with https://';

      const createEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.valid.id);

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
  });
});
