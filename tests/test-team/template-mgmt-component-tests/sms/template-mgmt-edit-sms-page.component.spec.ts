import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtEditSmsPage } from '../../pages/sms/template-mgmt-edit-sms-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertBackLinkTopNotPresent,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../../helpers/template-mgmt-common.steps';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    valid: TemplateFactory.createSmsTemplate(
      '578d292e-a4ae-411a-a7be-c2f1228b6459',
      user,
      'edit-sms-page-valid'
    ),
    submit: TemplateFactory.createSmsTemplate(
      '5b10cafb-ee25-47b6-85eb-540d7dc127b7',
      user,
      'edit-sms-page-submit'
    ),
    submitAndReturn: TemplateFactory.createSmsTemplate(
      '4a3fd84b-0685-4197-91ed-c058acbe1a61',
      user,
      'edit-sms-page-submit-and-return'
    ),
    goBackAndReturn: TemplateFactory.createSmsTemplate(
      '5f04230c-21df-4869-a911-7673f3b908fe',
      user,
      'edit-sms-page-go-back-and-return'
    ),
    noSmsTemplateType: TemplateFactory.create({
      id: 'be8a4618-17e5-45c4-855b-c91d55a3ff66',
      templateType: 'EMAIL',
      owner: `CLIENT#${user.clientId}`,
      clientId: user.clientId,
      name: 'no-sms-template-type-template',
      message: 'no-sms-template-type-template-message',
    }),
    previousData: {
      ...TemplateFactory.createSmsTemplate(
        'bef4d911-b3a6-4faa-99a9-b33505cb4875',
        user
      ),
      name: 'previous-data-sms-template',
      message: 'previous-data-sms-template-message',
    },
  };
}

test.describe('Edit SMS message template Page', () => {
  let templates: Record<string, Template>;
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
    const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

    await editSmsTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-text-message-template/${templates.valid.id}`
    );

    await expect(editSmsTemplatePage.pageHeading).toHaveText(
      'Edit text message template'
    );

    await expect(editSmsTemplatePage.pricingLink).toHaveAttribute(
      'href',
      '/pricing/text-messages'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtEditSmsPage(page),
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
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.previousData.id);

      await expect(editSmsTemplatePage.nameInput).toHaveValue(
        templates.previousData.name
      );
      await expect(editSmsTemplatePage.messageTextArea).toHaveValue(
        templates.previousData.message!
      );
    });

    test('character count', async ({ page }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.submit.id);

      await editSmsTemplatePage.nameInput.fill('template-name');

      await editSmsTemplatePage.messageTextArea.fill('a'.repeat(100));

      await expect(editSmsTemplatePage.characterCountText).toContainText(
        '100 characters'
      );

      await editSmsTemplatePage.messageTextArea.fill('a'.repeat(1000));

      await expect(editSmsTemplatePage.characterCountText).toContainText(
        '918 characters'
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.goBackAndReturn.id);

      await editSmsTemplatePage.customPersonalisationFields.click();
      await expect(
        editSmsTemplatePage.customPersonalisationFields
      ).toHaveAttribute('open');

      await editSmsTemplatePage.pdsPersonalisationFields.click();
      await expect(
        editSmsTemplatePage.pdsPersonalisationFields
      ).toHaveAttribute('open');
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.valid.id);

      await editSmsTemplatePage.messageFormatting.assertDetailsOpen([
        editSmsTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.valid.id);

      await editSmsTemplatePage.namingYourTemplate.click({
        position: { x: 0, y: 0 },
      });

      await expect(editSmsTemplatePage.namingYourTemplate).toHaveAttribute(
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
        const editTemplatePage = new TemplateMgmtEditSmsPage(page);
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
        const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

        await editSmsTemplatePage.loadPage(templates.goBackAndReturn.id);

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

    test('when user submits form with valid data, then the next page is displayed', async ({
      baseURL,
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.submit.id);

      await editSmsTemplatePage.nameInput.fill('This is an SMS template name');

      await editSmsTemplatePage.messageTextArea.fill('This is an SMS message');

      await editSmsTemplatePage.clickSaveAndPreviewButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-text-message-template/${templates.submit.id}?from=edit`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with mismatched template journey, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.attemptToLoadPageExpectFailure(
        templates.noSmsTemplateType.id
      );

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.attemptToLoadPageExpectFailure(
        '/fake-template-id'
      );

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.valid.id);

      await editSmsTemplatePage.nameInput.fill('');

      await editSmsTemplatePage.messageTextArea.fill('');

      await editSmsTemplatePage.clickSaveAndPreviewButton();

      await expect(editSmsTemplatePage.errorSummary).toBeVisible();

      await expect(editSmsTemplatePage.errorSummary.locator('h2')).toHaveText(
        'There is a problem'
      );

      await expect(
        editSmsTemplatePage.errorSummary.locator(`[href="#smsTemplateName"]`)
      ).toBeVisible();

      await expect(
        editSmsTemplatePage.errorSummary.locator(`[href="#smsTemplateMessage"]`)
      ).toBeVisible();
    });

    test('when user submits form with no "Template name", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template name';

      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.valid.id);

      await editSmsTemplatePage.nameInput.fill('');

      await editSmsTemplatePage.messageTextArea.fill('template-message');

      await editSmsTemplatePage.clickSaveAndPreviewButton();

      const smsNameErrorLink = editSmsTemplatePage.errorSummary.locator(
        `[href="#smsTemplateName"]`
      );

      await expect(smsNameErrorLink).toHaveText(errorMessage);

      await smsNameErrorLink.click();

      await expect(editSmsTemplatePage.nameInput).toBeFocused();
    });

    test('when user submits form with no "Template message", then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Enter a template message';

      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.valid.id);

      await editSmsTemplatePage.nameInput.fill('template-name');

      await editSmsTemplatePage.messageTextArea.fill('');

      await editSmsTemplatePage.clickSaveAndPreviewButton();

      const smsMessageErrorLink = editSmsTemplatePage.errorSummary.locator(
        '[href="#smsTemplateMessage"]'
      );

      await expect(smsMessageErrorLink).toHaveText(errorMessage);

      await smsMessageErrorLink.click();

      await expect(editSmsTemplatePage.messageTextArea).toBeFocused();
    });

    test('when user submits form with an http link, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'URLs must start with https://';

      const createSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await createSmsTemplatePage.loadPage(templates.valid.id);

      await createSmsTemplatePage.nameInput.fill('template-name');
      await createSmsTemplatePage.messageTextArea.fill(
        'http://www.example.com'
      );

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
