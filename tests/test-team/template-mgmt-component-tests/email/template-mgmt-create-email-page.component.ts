import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import { TemplateMgmtCreateEmailPage } from '../../pages/email/template-mgmt-create-email-page';
import { TemplateFactory } from '../../helpers/template-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { TemplateType } from '../../helpers/types';

const templates = {
  empty: TemplateFactory.createEmailTemplate('empty-email-template'),
  submit: TemplateFactory.createEmailTemplate('submit-email-template'),
  submitAndReturn: TemplateFactory.createEmailTemplate(
    'submit-and-return-create-email-template'
  ),
  goBackAndReturn: TemplateFactory.createEmailTemplate(
    'go-back-email-template'
  ),
  noEmailTemplateType: TemplateFactory.create({
    id: 'no-email-template-type-template',
    templateType: TemplateType.NHS_APP,
  }),
  previousData: {
    ...TemplateFactory.createEmailTemplate('previous-data-email-template'),
    name: 'previous-data-email-template',
    subject: 'previous-data-email-template-subject-line',
    message: 'previous-data-email-template-message',
  },
};

test.describe('Create Email message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

    await createEmailTemplatePage.loadPage(templates.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-email-template/${templates.empty.id}`
    );

    expect(await createEmailTemplatePage.pageHeader.textContent()).toBe(
      'Create email template'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtCreateEmailPage(page),
        id: templates.empty.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: 'templates/choose-a-template-type',
      });
    });

    test('when user visits page with previous data, then form fields retain previous data', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.previousData.id);

      await expect(createEmailTemplatePage.nameInput).toHaveValue(
        templates.previousData.name
      );
      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue(
        templates.previousData.subject
      );
      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        templates.previousData.message
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.goBackAndReturn.id);

      await createEmailTemplatePage.personalisationFields.click();

      await expect(
        createEmailTemplatePage.personalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.messageFormatting.assertDetailsOpen([
        createEmailTemplatePage.messageFormatting.lineBreaksAndParagraphs,
        createEmailTemplatePage.messageFormatting.headings,
        createEmailTemplatePage.messageFormatting.bulletPoints,
        createEmailTemplatePage.messageFormatting.numberedList,
        createEmailTemplatePage.messageFormatting.horizontalLines,
        createEmailTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });
      await expect(createEmailTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.submit.id);

      await createEmailTemplatePage.nameInput.fill(
        'This is an email template name'
      );

      await createEmailTemplatePage.subjectLineInput.fill(
        'This is an email template subject line'
      );

      await createEmailTemplatePage.messageTextArea.fill(
        'This is an email message'
      );

      await createEmailTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${templates.submit.id}`
      );
    });

    test('when user submits form with valid data and returns, then form fields retain previous data', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.submitAndReturn.id);

      const templateName = 'This is an email template name';
      const templateSubjectLine = 'This is an email template subject line';
      const templateMessage = 'This is an email message';

      await createEmailTemplatePage.nameInput.fill(templateName);

      await createEmailTemplatePage.subjectLineInput.fill(templateSubjectLine);

      await createEmailTemplatePage.messageTextArea.fill(templateMessage);

      await createEmailTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-email-template/${templates.submitAndReturn.id}`
      );

      await page
        .locator('.nhsuk-back-link__link')
        .and(page.getByText('Go back'))
        .click();

      await expect(createEmailTemplatePage.nameInput).toHaveValue(templateName);

      await expect(createEmailTemplatePage.subjectLineInput).toHaveValue(
        templateSubjectLine
      );

      await expect(createEmailTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.noEmailTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createEmailTemplatePage = new TemplateMgmtCreateEmailPage(page);

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.messageTextArea.fill('template-message');

      await createEmailTemplatePage.clickSubmitButton();

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

      await createEmailTemplatePage.loadPage(templates.empty.id);

      await createEmailTemplatePage.nameInput.fill('template-name');

      await createEmailTemplatePage.subjectLineInput.fill(
        'template-subject-line'
      );

      await createEmailTemplatePage.clickSubmitButton();

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
