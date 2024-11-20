import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

test.describe('Choose Template Type Page', () => {
  test('should land on "Choose Template Type" page when navigating to "/choose-a-template-type" url with empty template', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage('');

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);
    await expect(chooseTemplatePage.pageHeader).toHaveText(
      'Choose a template type to create'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtChoosePage(page),
      id: '',
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

    await chooseTemplatePage.loadPage('');

    await expect(chooseTemplatePage.radioButtons).toHaveCount(4);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.loadPage('');
    await chooseTemplatePage.clickSubmitButton();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);

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

      await chooseTemplatePage.loadPage('');
      await chooseTemplatePage.checkRadioButton(label);
      await chooseTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-${path}-template`
      );
    });
});
