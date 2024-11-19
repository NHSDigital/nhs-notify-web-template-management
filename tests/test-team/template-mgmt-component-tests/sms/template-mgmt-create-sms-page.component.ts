import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import { TemplateMgmtCreateSmsPage } from '../../pages/sms/template-mgmt-create-sms-page';
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
  empty: TemplateFactory.createSmsTemplate('empty-sms-template'),
  submit: TemplateFactory.createSmsTemplate('submit-sms-template'),
  submitAndReturn: TemplateFactory.createSmsTemplate(
    'submit-and-return-create-sms-template'
  ),
  goBackAndReturn: TemplateFactory.createSmsTemplate('go-back-sms-template'),
  noSmsTemplateType: TemplateFactory.create({
    id: 'no-sms-template-type-template',
    templateType: TemplateType.EMAIL,
  }),
  previousData: {
    ...TemplateFactory.createSmsTemplate('previous-data-sms-template'),
    name: 'previous-data-sms-template',
    message: 'previous-data-sms-template-message',
  },
};

test.describe('Create SMS message template Page', () => {
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
    const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

    await createSmsTemplatePage.loadPage(templates.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-text-message-template/${templates.empty.id}`
    );

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
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.previousData.id);

      await expect(createSmsTemplatePage.nameInput).toHaveValue(
        templates.previousData.name
      );
      await expect(createSmsTemplatePage.messageTextArea).toHaveValue(
        templates.previousData.message
      );
    });

    test('character count', async ({ page }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.submit.id);

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

      await createSmsTemplatePage.loadPage(templates.goBackAndReturn.id);

      await createSmsTemplatePage.personalisationFields.click();

      await expect(createSmsTemplatePage.personalisationFields).toHaveAttribute(
        'open'
      );
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.empty.id);

      await createSmsTemplatePage.messageFormatting.assertDetailsOpen([
        createSmsTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.empty.id);

      await createSmsTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(createSmsTemplatePage.namingYourTemplate).toHaveAttribute(
        'open'
      );
    });

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.submit.id);

      await createSmsTemplatePage.nameInput.fill(
        'This is an SMS template name'
      );

      await createSmsTemplatePage.messageTextArea.fill(
        'This is an SMS message'
      );

      await createSmsTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-text-message-template/${templates.submit.id}`
      );
    });

    test('when user submits form with valid data and returns, then form fields retain previous data', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.submitAndReturn.id);

      const templateName = 'This is an SMS template name';
      const templateMessage = 'This is an SMS message';

      await createSmsTemplatePage.nameInput.fill(templateName);

      await createSmsTemplatePage.messageTextArea.fill(templateMessage);

      await createSmsTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-text-message-template/${templates.submitAndReturn.id}`
      );

      await page
        .locator('.nhsuk-back-link__link')
        .and(page.getByText('Go back'))
        .click();

      await expect(createSmsTemplatePage.nameInput).toHaveValue(templateName);

      await expect(createSmsTemplatePage.messageTextArea).toHaveValue(
        templateMessage
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.noSmsTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const createSmsTemplatePage = new TemplateMgmtCreateSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.empty.id);

      await createSmsTemplatePage.clickSubmitButton();

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

      await createSmsTemplatePage.loadPage(templates.empty.id);

      await createSmsTemplatePage.messageTextArea.fill('template-message');

      await createSmsTemplatePage.clickSubmitButton();

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

      await createSmsTemplatePage.loadPage(templates.empty.id);

      await createSmsTemplatePage.nameInput.fill('template-name');

      await createSmsTemplatePage.clickSubmitButton();

      const smsMessageErrorLink = createSmsTemplatePage.errorSummary.locator(
        '[href="#smsTemplateMessage"]'
      );

      await expect(smsMessageErrorLink).toHaveText(errorMessage);

      await smsMessageErrorLink.click();

      await expect(createSmsTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
