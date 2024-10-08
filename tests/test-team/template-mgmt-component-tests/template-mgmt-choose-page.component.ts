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
