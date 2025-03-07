import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtEditEmailPage } from '../../pages/email/template-mgmt-edit-email-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertGoBackLinkNotPresent,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { TemplateType } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    empty: TemplateFactory.createEmailTemplate('empty-email-template', owner),
    submit: TemplateFactory.createEmailTemplate('submit-email-template', owner),
    submitAndReturn: TemplateFactory.createEmailTemplate(
      'submit-and-return-create-email-template',
      owner
    ),
    goBackAndReturn: TemplateFactory.createEmailTemplate(
      'go-back-email-template',
      owner
    ),
    noEmailTemplateType: TemplateFactory.create({
      id: 'no-email-template-type-template',
      templateType: 'NHS_APP',
      name: 'no-email-template-type-template',
      owner,
    }),
    previousData: {
      ...TemplateFactory.createEmailTemplate(
        'previous-data-email-template',
        owner
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
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
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

    await editEmailTemplatePage.loadPage(templates.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-email-template/${templates.empty.id}`
    );

    await expect(editEmailTemplatePage.pageHeader).toHaveText(
      'Edit email template'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtEditEmailPage(page),
        id: templates.empty.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertGoBackLinkNotPresent(props);
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

      await editEmailTemplatePage.personalisationFields.click();

      await expect(editEmailTemplatePage.personalisationFields).toHaveAttribute(
        'open'
      );
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.empty.id);

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
        await editTemplatePage.loadPage('empty-email-template');
        const newTabPromise = page.waitForEvent('popup');
        await page.getByRole('link', { name }).click();
        const newTab = await newTabPromise;
        await expect(newTab).toHaveURL(`${baseURL}/${url}`);
      });
    }

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editEmailTemplatePage = new TemplateMgmtEditEmailPage(page);

      await editEmailTemplatePage.loadPage(templates.empty.id);

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

      await editEmailTemplatePage.loadPage(templates.noEmail'id');

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

      await editEmailTemplatePage.loadPage(templates.empty.id);

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

      await editEmailTemplatePage.loadPage(templates.empty.id);

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

      await editEmailTemplatePage.loadPage(templates.empty.id);

      await editEmailTemplatePage.nameInput.fill('template-name');

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

      await editEmailTemplatePage.loadPage(templates.empty.id);

      await editEmailTemplatePage.nameInput.fill('template-name');

      await editEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await editEmailTemplatePage.clickSaveAndPreviewButton();

      const emailMessageErrorLink = editEmailTemplatePage.errorSummary.locator(
        '[href="#emailTemplateMessage"]'
      );

      await expect(emailMessageErrorLink).toHaveText(errorMessage);

      await emailMessageErrorLink.click();

      await expect(editEmailTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
