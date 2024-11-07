import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { Template, TemplateType } from '../helpers/types';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

export const emptyTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: '3d98b0c4-6666-0000-0000-95eb27590000',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: 'UNKNOWN',
};

export const templateDataForRadioSelect: Template = {
  __typename: 'TemplateStorage',
  version: 1,
  id: '3d98b0c4-6666-0000-0000-95eb27590001',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: 'UNKNOWN',
};

export const nhsAppRadioSelectedTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: 'nhsapp-6666-0000-0000-95eb27590002',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
};

export const emailRadioSelectedTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: 'email-6666-0000-0000-95eb27590002',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
};

export const letterRadioSelectedTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: 'letter-6666-0000-0000-95eb27590002',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.LETTER,
};

export const smsRadioSelectedTemplateData: Template = {
  __typename: 'TemplateStorage',
  id: 'sms-6666-0000-0000-95eb27590002',
  version: 1,
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.SMS,
};

test.describe('Choose Template Type Page', () => {
  const templateStorageHelper = new TemplateStorageHelper([
    emptyTemplateData,
    templateDataForRadioSelect,
    nhsAppRadioSelectedTemplateData,
    emailRadioSelectedTemplateData,
    smsRadioSelectedTemplateData,
    letterRadioSelectedTemplateData,
  ]);

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('should land on "Choose Template Type" page when navigating to "/choose-a-template-type" url with empty template', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage(emptyTemplateData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptyTemplateData.id}`
    );
    await expect(chooseTemplatePage.pageHeader).toHaveText(
      'Choose a template type to create'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtChoosePage(page),
      id: emptyTemplateData.id,
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertFooterLinks(props);
    await assertLoginLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage(emptyTemplateData.id);

    await expect(chooseTemplatePage.radioButtons).toHaveCount(4);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage(emptyTemplateData.id);
    await chooseTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptyTemplateData.id}`
    );

    await expect(chooseTemplatePage.errorSummary).toBeVisible();
    await expect(chooseTemplatePage.errorSummaryList).toHaveText([
      'Select a template type',
    ]);
  });

  for (const { label, path } of [
    { label: 'NHS App message', path: 'nhs-app' },
    { label: 'Email', path: 'email' },
    { label: 'Text message (SMS)', path: 'text-message' },
    { label: 'Letter', path: 'letter' },
  ])
    test(`should navigate to the ${label} template creation page when radio button selected and continue button clicked`, async ({
      page,
      baseURL,
    }) => {
      const chooseTemplatePage = new TemplateMgmtChoosePage(page);

      await chooseTemplatePage.loadPage(templateDataForRadioSelect.id);
      await chooseTemplatePage.checkRadioButton(label);
      await chooseTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-${path}-template/${templateDataForRadioSelect.id}`
      );
    });

  for (const { label, templateData } of [
    { label: 'NHS App message', templateData: nhsAppRadioSelectedTemplateData },
    { label: 'Email', templateData: emailRadioSelectedTemplateData },
    { label: 'Text message (SMS)', templateData: smsRadioSelectedTemplateData },
    { label: 'Letter', templateData: letterRadioSelectedTemplateData },
  ]) {
    test(`should display ${label} radio button selected if present in template storage`, async ({
      page,
    }) => {
      const chooseTemplatePage = new TemplateMgmtChoosePage(page);

      await chooseTemplatePage.loadPage(templateData.id);

      expect(page.getByLabel(label)).toBeChecked();
    });
  }

  test('should navigate to error page if templateId invalid', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage('invalid-templateId');

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
