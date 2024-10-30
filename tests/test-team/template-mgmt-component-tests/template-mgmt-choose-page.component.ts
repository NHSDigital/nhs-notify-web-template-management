import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

export const emptySessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-0000-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: 'UNKNOWN',
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const sessionDataForRadioSelect: Session = {
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
  id: 'nhsapp-6666-0000-0000-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const emailRadioSelectedSessionData: Session = {
  __typename: 'SessionStorage',
  id: 'email-6666-0000-0000-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const letterRadioSelectedSessionData: Session = {
  __typename: 'SessionStorage',
  id: 'letter-6666-0000-0000-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.LETTER,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

export const smsRadioSelectedSessionData: Session = {
  __typename: 'SessionStorage',
  id: 'sms-6666-0000-0000-95eb27590002',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.SMS,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

test.describe('Choose Template Type Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    emptySessionData,
    sessionDataForRadioSelect,
    nhsAppRadioSelectedSessionData,
    emailRadioSelectedSessionData,
    smsRadioSelectedSessionData,
    letterRadioSelectedSessionData,
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

    await chooseTemplatePage.loadPage(emptySessionData.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
    );
    await expect(chooseTemplatePage.pageHeader).toHaveText(
      'Choose a template type to create'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtChoosePage(page),
      id: emptySessionData.id,
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

    await chooseTemplatePage.loadPage(emptySessionData.id);

    await expect(chooseTemplatePage.radioButtons).toHaveCount(4);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage(emptySessionData.id);
    await chooseTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type/${emptySessionData.id}`
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

      await chooseTemplatePage.loadPage(sessionDataForRadioSelect.id);
      await chooseTemplatePage.checkRadioButton(label);
      await chooseTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-${path}-template/${sessionDataForRadioSelect.id}`
      );
    });

  for (const { label, sessionData } of [
    { label: 'NHS App message', sessionData: nhsAppRadioSelectedSessionData },
    { label: 'Email', sessionData: emailRadioSelectedSessionData },
    { label: 'Text message (SMS)', sessionData: smsRadioSelectedSessionData },
    { label: 'Letter', sessionData: letterRadioSelectedSessionData },
  ]) {
    test(`should display ${label} radio button selected if present in session storage`, async ({
      page,
    }) => {
      const chooseTemplatePage = new TemplateMgmtChoosePage(page);

      await chooseTemplatePage.loadPage(sessionData.id);

      expect(page.getByLabel(label)).toBeChecked();
    });
  }

  test('should navigate to error page if sessionId invalid', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage('invalid-sessionId');

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
  });
});
