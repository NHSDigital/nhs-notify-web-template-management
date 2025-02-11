import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtEditSmsPage } from '../../pages/sms/template-mgmt-edit-sms-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertGoBackLinkNotPresent,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { Template, TemplateType } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    empty: TemplateFactory.createSmsTemplate('empty-sms-template', owner),
    submit: TemplateFactory.createSmsTemplate('submit-sms-template', owner),
    submitAndReturn: TemplateFactory.createSmsTemplate(
      'submit-and-return-create-sms-template',
      owner
    ),
    goBackAndReturn: TemplateFactory.createSmsTemplate(
      'go-back-sms-template',
      owner
    ),
    noSmsTemplateType: TemplateFactory.create({
      id: 'no-sms-template-type-template',
      templateType: TemplateType.EMAIL,
      owner,
      name: 'no-sms-template-type-template',
    }),
    previousData: {
      ...TemplateFactory.createSmsTemplate('previous-data-sms-template', owner),
      name: 'previous-data-sms-template',
      message: 'previous-data-sms-template-message',
    },
  };
}

test.describe('Edit SMS message template Page', () => {
  let templates: Record<string, Template>;
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
    const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

    await editSmsTemplatePage.loadPage(templates.empty.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-text-message-template/${templates.empty.id}`
    );

    expect(await editSmsTemplatePage.pageHeader.textContent()).toBe(
      'Create text message template'
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
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.previousData.id);

      await expect(editSmsTemplatePage.nameInput).toHaveValue(
        templates.previousData.name
      );
      await expect(editSmsTemplatePage.messageTextArea).toHaveValue(
        templates.previousData.message
      );
    });

    test('character count', async ({ page }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.submit.id);

      await editSmsTemplatePage.nameInput.fill('template-name');

      await editSmsTemplatePage.messageTextArea.fill('a'.repeat(100));

      await expect(editSmsTemplatePage.characterCountText).toHaveText(
        '100 characters'
      );

      await editSmsTemplatePage.messageTextArea.fill('a'.repeat(1000));

      await expect(editSmsTemplatePage.characterCountText).toHaveText(
        '918 characters'
      );
    });

    test('when user clicks "Personalisation" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.goBackAndReturn.id);

      await editSmsTemplatePage.personalisationFields.click();

      await expect(editSmsTemplatePage.personalisationFields).toHaveAttribute(
        'open'
      );
    });

    test('when user clicks "Message formatting" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.empty.id);

      await editSmsTemplatePage.messageFormatting.assertDetailsOpen([
        editSmsTemplatePage.messageFormatting.linksAndUrls,
      ]);
    });

    test('when user clicks "Naming your templates" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.empty.id);

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
        await editTemplatePage.loadPage('empty-sms-template');
        const newTabPromise = page.waitForEvent('popup');
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

      await editSmsTemplatePage.clickSubmitButton();

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

      await editSmsTemplatePage.loadPage(templates.noSmsTemplateType.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits form with no data, then errors are displayed', async ({
      page,
    }) => {
      const editSmsTemplatePage = new TemplateMgmtEditSmsPage(page);

      await editSmsTemplatePage.loadPage(templates.empty.id);

      await editSmsTemplatePage.clickSubmitButton();

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

      await editSmsTemplatePage.loadPage(templates.empty.id);

      await editSmsTemplatePage.messageTextArea.fill('template-message');

      await editSmsTemplatePage.clickSubmitButton();

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

      await editSmsTemplatePage.loadPage(templates.empty.id);

      await editSmsTemplatePage.nameInput.fill('template-name');

      await editSmsTemplatePage.clickSubmitButton();

      const smsMessageErrorLink = editSmsTemplatePage.errorSummary.locator(
        '[href="#smsTemplateMessage"]'
      );

      await expect(smsMessageErrorLink).toHaveText(errorMessage);

      await smsMessageErrorLink.click();

      await expect(editSmsTemplatePage.messageTextArea).toBeFocused();
    });
  });
});
