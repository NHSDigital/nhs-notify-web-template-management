import { test, expect } from '@playwright/test';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

export const emptySessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const emptySessionForTemplateCreation: Session = {
  __typename: 'SessionStorage',
  id: '4d98b0c4-7777-0000-1111-95eb27590011',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test.describe('Create NHS App Template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    emptySessionData,
    emptySessionForTemplateCreation,
  ]);

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });

  test('should navigate to the NHS App template creation page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCreatePage(page),
      id: emptySessionData.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLoginLink(props);
    await assertFooterLinks(props);
    await assertGoBackLink({
      ...props,
      expectedUrl: `templates/choose-a-template-type/${emptySessionData.id}`,
    });
  });

  test('Validate error messages on the create NHS App message template page with no template name or body', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name', 'Enter a template message']);
  });

  test('NHS App Message template populated and continued to the preview screen displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionForTemplateCreation.id}`
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickSubmitButton();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'NHS Testing 123'
    );
  });

  test('Validate error messages on the create NHS App message template page with a no template message', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template message']);
  });

  test('Validate error messages on the create NHS App message template page with no template name', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickSubmitButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();

    await expect(
      page.locator('ul[class="nhsuk-list nhsuk-error-summary__list"] > li')
    ).toHaveText(['Enter a template name']);
  });

  test('5000 words Entered in Template body and word count correctly displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionForTemplateCreation.id}`
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
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.loadPage(emptySessionForTemplateCreation.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionForTemplateCreation.id}`
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
    test(`personalisation mark expanding fields for ${section}`, async ({
      page,
      baseURL,
    }) => {
      const createTemplatePage = new TemplateMgmtCreatePage(page);
      await createTemplatePage.loadPage(emptySessionData.id);
      await expect(page).toHaveURL(
        `${baseURL}/templates/create-nhs-app-template/${emptySessionData.id}`
      );

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeVisible();

      await page.locator(`${section} > summary`).click();
      await expect(page.locator(section)).not.toHaveAttribute('open');
      await expect(page.locator(`${section} > div`)).toBeHidden();
    });
  }

  test('Invalid session ID test', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);
    const invalidSessionId = 'invalid-session-id';
    await createTemplatePage.loadPage(invalidSessionId);
    const errorMessage = page.locator('.nhsuk-heading-xl');
    await Promise.all([
      expect(errorMessage).toBeVisible(),
      expect(errorMessage).toHaveText('Sorry, we could not find that page'),
      expect(page).toHaveURL(`${baseURL}/templates/invalid-session`),
    ]);
  });
});
