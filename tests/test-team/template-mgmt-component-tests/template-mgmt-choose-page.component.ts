import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';

export const emptySessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-0000-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const emptySessionDataForRadioSelect: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-0000-95eb27590001',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const nhsAppRadioSelectedSessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d90000-6666-0000-0000-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test.describe('Choose Template Type Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    emptySessionData,
    emptySessionDataForRadioSelect,
    nhsAppRadioSelectedSessionData,
  ]);

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });

  test('should land on "Choose Template Type" page when navigating to "/choose-a-template-type" url with empty session', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );
    expect(await chooseTemplatePage.fieldsetHeading.textContent()).toBe(
      'Choose a template type to create'
    );
  });

  test('should navigate to start page when "notify banner link" clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);
    await chooseTemplatePage.clickNotifyBannerLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
  });

  test(
    'should navigate to login page when "log in" link clicked',
    { tag: '@Update/CCM-4889' },
    async ({ page, baseURL }) => {
      const chooseTemplatePage = new TemplateMgmtChoosePage(page);

      await chooseTemplatePage.navigateToChooseTemplatePage(
        emptySessionData.id
      );
      await chooseTemplatePage.clickLoginLink();

      await expect(page).toHaveURL(`${baseURL}/templates`);
    }
  );

  test('should display correct radio button options', async ({ page }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(page.locator('[class="nhsuk-radios__item"]')).toHaveCount(4);
    await expect(page.locator('[class="nhsuk-radios__item"]')).toHaveText(
      TemplateMgmtChoosePage.templateOptions
    );
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);
    await chooseTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );

    expect(await chooseTemplatePage.fieldsetHeading.textContent()).toBe(
      'Choose a template type to create'
    );

    await expect(page.locator('[class="nhsuk-error-summary"]')).toBeVisible();

    await expect(
      page
        .locator('[class="nhsuk-list nhsuk-error-summary__list"]')
        .getByRole('listitem')
    ).toHaveText(['Select a template type']);
  });

  test('should navigate to the NHS App template creation page when radio button selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(
      emptySessionDataForRadioSelect.id
    );
    await TemplateMgmtChoosePage.checkRadioButton(
      page.locator('[id="templateType-NHS_APP"]')
    );
    await chooseTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${emptySessionDataForRadioSelect.id}`
    );
  });

  test('should display NHS App radio button selected if present in session storage', async ({
    page,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(
      nhsAppRadioSelectedSessionData.id
    );

    // expect to assert radio selected
  });

  test('should not display "Go Back" link on page', async ({ page }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(chooseTemplatePage.goBackLink).toBeHidden();
  });
});

// place holder jazman ----------------------------------------------
test.describe.only('NHS App Message Template tests -in progress', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    emptySessionData,
    emptySessionDataForRadioSelect,
    nhsAppRadioSelectedSessionData,
  ]);

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });
  test('Validate error messages on the create NHS App message template page', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );
    expect(await chooseTemplatePage.fieldsetHeading.textContent()).toBe(
      'Choose a template type to create'
    );
    await TemplateMgmtChoosePage.checkRadioButton(
      page.locator('[id="templateType-NHS_APP"]')
    );
    await chooseTemplatePage.clickContinueButton();
    await page.waitForTimeout(3000);
    await chooseTemplatePage.clickContinueButton();
    await page.waitForTimeout(3000);
    await expect(page.locator('.nhsuk-error-summary')).toBeVisible();
    await expect(page.locator('.nhsuk-error-summary')).toHaveText([
      'There is a problemEnter a template nameEnter a template message',
    ]);
  });

  test('NHS App Message template populated and continued to the preview screen displayed', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );
    expect(await chooseTemplatePage.fieldsetHeading.textContent()).toBe(
      'Choose a template type to create'
    );
    await TemplateMgmtChoosePage.checkRadioButton(
      page.locator('[id="templateType-NHS_APP"]')
    );
    await chooseTemplatePage.clickContinueButton();
    await expect(page.locator('h1')).toHaveText(
      'Create NHS App message template'
    );
    const templateName = 'NHS Testing 123'; // Replace with the text you want to enter
    await page.locator('[id="nhsAppTemplateName"]').fill(templateName);
    const templateMessage = 'Test Message box'; // Replace with the text you want to enter
    await page.locator('[id="nhsAppTemplateMessage"]').fill(templateMessage);
    await chooseTemplatePage.clickContinueButton();
    await expect(page.locator('h1')).toHaveText(
      'NHS App message templateNHS Testing 123'
    );
  });

  test('Hyperlinks & back button functionality', async ({ page, baseURL }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );
    expect(await chooseTemplatePage.fieldsetHeading.textContent()).toBe(
      'Choose a template type to create'
    );
    await TemplateMgmtChoosePage.checkRadioButton(
      page.locator('[id="templateType-NHS_APP"]')
    );
    await chooseTemplatePage.clickContinueButton();
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
    await chooseTemplatePage.clickBackLink();
  });

  test('4 personalisation mark expanding fields', () => {});
  test('5 invalid session ID test - In progress placeholder', () => {});
  test('6 should display correct radio button options - In progress placeholder', () => {});
});
