/* eslint-disable no-await-in-loop */
import { test, expect } from '@playwright/test';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';

export const nhsAppNoTemplateSessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const nhsAppNoTemplateSessionDataForInput: Session = {
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
    nhsAppNoTemplateSessionData,
    nhsAppNoTemplateSessionDataForInput,
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

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });

  test('Validate error messages on the create NHS App message template page with no template name or body', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    await createTemplatePage.clickContinueButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.locator('.nhsuk-error-summary')).toHaveText([
      'There is a problemEnter a template nameEnter a template message',
    ]);
  });

  test('NHS App Message template populated and continued to the preview screen displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionDataForInput.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionDataForInput.id}`
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickContinueButton();
    await expect(page.locator('h1')).toHaveText(
      'NHS App message templateNHS Testing 123'
    );
  });

  test('Validate error messages on the create NHS App message template page with a no template message', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    await createTemplatePage.clickContinueButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.locator('.nhsuk-error-summary')).toHaveText([
      'There is a problemEnter a template message',
    ]);
  });

  test('Validate error messages on the create NHS App message template page with no template name', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
    const templateMessage = 'Test Message box';
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await createTemplatePage.clickContinueButton();
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.locator('.nhsuk-error-summary')).toHaveText([
      'There is a problemEnter a template name',
    ]);
  });

  test('404 Error returned when login link clicked', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);
    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    await createTemplatePage.clickLoginLink();
    await expect(page.locator('h1')).toHaveText('404');
    await expect(page.getByText('This page could not be found')).toBeVisible();
  });

  test('5000 words Entered in Template body and word count correctly displayed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionDataForInput.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionDataForInput.id}`
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'T'.repeat(5000).trim();
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();
  });

  test('5001 words attempted to be entered in Template body and only 5000 allowed', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionDataForInput.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionDataForInput.id}`
    );
    const templateName = 'NHS Testing 123';
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'T'.repeat(5001).trim();
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await expect(page.getByText('5000 of 5000 characters')).toBeVisible();
  });

  test('Hyperlinks functionality', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    const footerLinks = [
      {
        name: 'Home',
        selector: 'a[data-testid="accessibility-statement-link"]',
      },
      { name: 'Contact Us', selector: 'a[data-testid="contact-us-link"]' },
      { name: 'Cookies', selector: 'a[data-testid="cookies-link"]' },
      {
        name: 'Privacy Policy',
        selector: 'a[data-testid="privacy-policy-link"]',
      },
      {
        name: 'Terms and Conditions',
        selector: 'a[data-testid="terms-and-conditions-link"]',
      },
    ];

    await Promise.all(
      footerLinks.map((link) =>
        expect(
          page.locator(link.selector),
          `${link.name} should be visible`
        ).toBeVisible()
      )
    );
    await expect(page.locator('.nhsuk-back-link__link')).toBeVisible();
    await createTemplatePage.clickBackLink();
  });

  test('Back button functionality', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    await expect(page.locator('.nhsuk-back-link__link')).toBeVisible();
    await createTemplatePage.clickBackLink();
    await expect(page.locator('h1')).toHaveText(
      'Choose a template type to create'
    );
  });

  test('personalisation mark expanding fields', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);
    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );
    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );

    const sections = [
      '[data-testid="personalisation-details"]',
      '[data-testid="lines-breaks-and-paragraphs-details"]',
      '[data-testid="headings-details"]',
      '[data-testid="bold-text-details"]',
      '[data-testid="naming-your-templates"]',
      '[data-testid="link-and-url-details"]',
    ];
    // note: turning this into a promise makes this very flakey
    for (const section of sections) {
      const locator = page.locator(section);
      await expect(locator).toBeVisible();
      await locator.click({ position: { x: 0, y: 0 } });
      await expect(locator).toHaveAttribute('open');
    }
  });

  test('Invalid session ID test', async ({ page, baseURL }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);
    const invalidSessionId = 'invalid-session-id';
    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      invalidSessionId
    );
    const errorMessage = page.locator('.nhsuk-heading-xl');
    await Promise.all([
      expect(errorMessage).toBeVisible(),
      expect(errorMessage).toHaveText('Sorry, we could not find that page'),
      expect(page).toHaveURL(`${baseURL}/templates/invalid-session`),
    ]);
  });
});
