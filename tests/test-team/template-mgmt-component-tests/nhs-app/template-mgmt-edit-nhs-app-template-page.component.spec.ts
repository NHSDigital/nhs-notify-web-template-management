import { test, expect } from '@playwright/test';
import { TemplateMgmtEditNhsAppPage } from '../../pages/nhs-app/template-mgmt-edit-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
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
    valid: TemplateFactory.createNhsAppTemplate(
      'c1597c0e-67c0-459f-bad9-3828ead548ff',
      user,
      'edit-nhs-app-template-valid'
    ),
    submit: TemplateFactory.createNhsAppTemplate(
      '659f83ed-6fce-4176-9f69-42274cdfed1d',
      user,
      'edit-nhs-app-template-submit'
    ),
    submitAndReturn: TemplateFactory.createNhsAppTemplate(
      '2570c7b5-469c-43b2-bb59-f2e5352d0001',
      user,
      'edit-nhs-app-template-submit-and-return'
    ),
  };
}

test.describe('Edit NHS App Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Record<string, Template>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('should navigate to the NHS App template edit page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
    );
    await expect(editTemplatePage.pageHeading).toHaveText(
      'Edit NHS App message template'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtEditNhsAppPage(page).setPathParam(
        'templateId',
        templates.valid.id
      ),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertBackLinkTopNotPresent(props);
  });

  test('Validate error messages on the edit NHS App message template page with no template name or body', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
    );
    await expect(editTemplatePage.pageHeading).toHaveText(
      'Edit NHS App message template'
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('');
    await page.locator('[id="nhsAppTemplateMessage"]').fill('');
    await editTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Enter a template message']);
  });

  test('when user submits form with valid data, then the next page is displayed', async ({
    page,
    baseURL,
  }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.submit.id
    );

    await editTemplatePage.loadPage();
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
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
    );
    await expect(editTemplatePage.pageHeading).toHaveText(
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
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
    );
    await expect(editTemplatePage.pageHeading).toHaveText(
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
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
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
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await editTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
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

  test('Validate error messages on the edit NHS App message template page with http url in message', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtEditNhsAppPage(
      page
    ).setPathParam('templateId', templates.valid.id);

    await createTemplatePage.loadPage();
    await expect(createTemplatePage.pageHeading).toHaveText(
      'Edit NHS App message template'
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('template-name');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('http://www.example.com');
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['URLs must start with https://']);
  });

  test('Validate error messages on the edit NHS App message template page with angle brackets in linked url', async ({
    page,
  }) => {
    const createTemplatePage = new TemplateMgmtEditNhsAppPage(
      page
    ).setPathParam('templateId', templates.valid.id);

    await createTemplatePage.loadPage();
    await expect(createTemplatePage.pageHeading).toHaveText(
      'Edit NHS App message template'
    );
    await page.locator('[id="nhsAppTemplateName"]').fill('template-name');
    await page
      .locator('[id="nhsAppTemplateMessage"]')
      .fill('[example](https://www.example.com/<>)');
    await createTemplatePage.clickSaveAndPreviewButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['URLs cannot include the symbols < or >']);
  });

  const detailsSections = [
    'pds-personalisation-fields',
    'custom-personalisation-fields',
    'line-breaks-and-paragraphs',
    'headings',
    'bold-text',
    'bullet-points',
    'numbered-lists',
    'links-and-urls',
    'how-to-name-your-template',
  ];

  for (const section of detailsSections) {
    // eslint-disable-next-line no-loop-func
    test(`when user clicks ${section} tool tip, then tool tip is displayed ${section}`, async ({
      page,
      baseURL,
    }) => {
      const editTemplatePage = new TemplateMgmtEditNhsAppPage(
        page
      ).setPathParam('templateId', templates.valid.id);
      await editTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
      );

      await page.getByTestId(`${section}-summary`).click();
      await expect(page.getByTestId(`${section}-details`)).toHaveAttribute(
        'open',
        ''
      );
      await expect(page.getByTestId(`${section}-text`)).toBeVisible();

      await page.getByTestId(`${section}-summary`).click();
      await expect(page.getByTestId(`${section}-details`)).not.toHaveAttribute(
        'open'
      );
      await expect(page.getByTestId(`${section}-text`)).toBeHidden();
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
      const editTemplatePage = new TemplateMgmtEditNhsAppPage(
        page
      ).setPathParam('templateId', templates.valid.id);
      await editTemplatePage.loadPage();
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
      const editTemplatePage = new TemplateMgmtEditNhsAppPage(
        page
      ).setPathParam('templateId', templates.valid.id);

      await editTemplatePage.loadPage();

      const newTabPromise = page.waitForEvent('popup');

      const summary = page.getByTestId('custom-personalisation-fields-summary');

      await summary.click();
      await expect(
        page.getByTestId('custom-personalisation-fields-text')
      ).toBeVisible();

      await page.getByRole('link', { name }).click();

      const newTab = await newTabPromise;

      await expect(newTab).toHaveURL(`${baseURL}/${url}`);
    });
  }

  test('Invalid template ID test', async ({ page, baseURL }) => {
    const editTemplatePage = new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      'invalid-template-id'
    );

    await editTemplatePage.attemptToLoadPageExpectFailure();
    const errorMessage = page.locator('.nhsuk-heading-xl');
    await Promise.all([
      expect(errorMessage).toBeVisible(),
      expect(errorMessage).toHaveText('Sorry, we could not find that page'),
      expect(page).toHaveURL(`${baseURL}/templates/invalid-template`),
    ]);
  });
});
