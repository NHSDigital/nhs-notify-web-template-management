import { test, expect } from '@playwright/test';
import { TemplateMgmtEditNhsAppPage } from '../../pages/nhs-app/template-mgmt-edit-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertGoBackLinkNotPresent,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    editTemplateData: TemplateFactory.createNhsAppTemplate(
      'edit-nhs-app-template',
      owner
    ),
    submit: TemplateFactory.createNhsAppTemplate(
      'submit-nhs-app-template',
      owner
    ),
    submitAndReturn: TemplateFactory.createNhsAppTemplate(
      'submit-and-return-nhs-app-template',
      owner
    ),
  };
}

test.describe('Edit NHS App Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('should navigate to the NHS App template edit page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );
    await expect(editTemplatePage.pageHeader).toHaveText(
      'Edit NHS App message template'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtEditNhsAppPage(page),
      id: templates.editTemplateData.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('Validate error messages on the edit NHS App message template page with no template name or body', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );
    await expect(editTemplatePage.pageHeader).toHaveText(
      'Edit NHS App message template'
    );
    await editTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await page.locator('[id="nhsAppTemplateName"]').fill('');
    await page.locator('[id="nhsAppTemplateMessage"]').fill('');
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Enter a template message']);
  });

  test('when user submits form with valid data, then the next page is displayed', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.submit.id);
    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.submit.id}`
    );
    await page
      .locator('[id="nhsAppTemplateName"]')
      .fill('This is an NHS App template name');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('This is an NHS App message');
    await editTemplatePage.clickSaveAndPreviewButton();
    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-nhs-app-template/${templates.submit.id}?from=edit`
    );
  });

  test('Validate error messages on the edit NHS App message template page with a no template message', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );
    await expect(editTemplatePage.pageHeader).toHaveText(
      'Edit NHS App message template'
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    await page.locator('[id="nhsAppTemplateMessage"]').fill('');
    await editTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template message']);
  });

  test('Validate error messages on the edit NHS App message template page with no template name', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );
    await expect(editTemplatePage.pageHeader).toHaveText(
      'Edit NHS App message template'
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('');
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await editTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name']);
  });

  test('5000 words Entered in Template body and word count correctly displayed', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('T'.repeat(5000).trim());
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();
  });

  test('5001 words attempted to be entered in Template body and only 5000 allowed', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);

    await editTemplatePage.loadPage(templates.editTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
    );

    await page.locator('[id="nhsAppTemplateName"]').fill('NHS Testing 123');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('T'.repeat(5001).trim());
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();

    const messageContent = await page
      .getByRole('textbox', { name: 'Message' })
      .textContent();

    expect(messageContent).toHaveLength(5000);
  });

  const detailsSections = [
    '[data-testid="personalisation-details"]',
    '[data-testid="lines-breaks-and-paragraphs-details"]',
    '[data-testid="headings-details"]',
    '[data-testid="bold-text-details"]',
    '[data-testid="link-and-url-details"]',
    '[data-testid="how-to-name-your-template"]',
  ];

  for (const section of detailsSections) {
    // eslint-disable-next-line no-loop-func
    test(`when user clicks ${section} tool tip, then tool tip is displayed ${section}`, async ({
      page,
      baseURL,
    }) => {
      const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);
      await editTemplatePage.loadPage(templates.editTemplateData.id);
      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${templates.editTemplateData.id}`
      );

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeVisible();

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).not.toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeHidden();
    });
  }

  const moreInfoLinks = [
    {
      name: 'NHS App messages (opens in a new tab)',
      url: 'features/nhs-app-messages',
    },
    {
      name: 'Delivery times (opens in a new tab)',
      url: 'using-nhs-notify/delivery-times',
    },
    {
      name: 'Sender IDs (opens in a new tab)',
      url: 'using-nhs-notify/tell-recipients-who-your-messages-are-from',
    },
  ];

  for (const { name, url } of moreInfoLinks) {
    test(`more info link: ${name}, navigates to correct page in new tab`, async ({
      page,
      baseURL,
    }) => {
      const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);
      await editTemplatePage.loadPage('empty-nhs-app-template');
      const newTabPromise = page.waitForEvent('popup');
      await page.getByRole('link', { name }).click();
      const newTab = await newTabPromise;
      await expect(newTab).toHaveURL(`${baseURL}/${url}`);
    });
  }

  test('Invalid template ID test', async ({ page, baseURL }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page);
    const invalidTemplateId = 'invalid-template-id';
    await editTemplatePage.loadPage(invalidTemplateId);
    const errorMessage = page.locator('.nhsuk-heading-xl');
    await Promise.all([
      expect(errorMessage).toBeVisible(),
      expect(errorMessage).toHaveText('Sorry, we could not find that page'),
      expect(page).toHaveURL(`${baseURL}/templates/invalid-template`),
    ]);
  });
});
