import { test, expect } from '@playwright/test';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

test.describe('Start Page', () => {
  test('should land on start page when navigating to "/templates/create-and-submit-templates"', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
    await expect(startPage.pageHeader).toHaveText(
      'Create and submit a template to NHS Notify'
    );
  });

  test('should display correct list of template types', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();

    await expect(startPage.listOfTemplates.getByRole('listitem')).toHaveText(
      TemplateMgmtStartPage.templateOptions
    );
  });

  test('should navigate to start page when "notify banner link" clicked', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();
    await startPage.clickNotifyBannerLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
    expect(await startPage.pageHeader.textContent()).toBe(
      'Create and submit a template to NHS Notify'
    );
  });

  test(
    'should navigate to login page when "log in" link clicked',
    { tag: '@Update/CCM-4889' },
    async ({ page, baseURL }) => {
      const startPage = new TemplateMgmtStartPage(page);

      await startPage.loadPage();
      await startPage.clickLoginLink();

      await expect(page).toHaveURL(`${baseURL}/templates`);

      expect(await page.locator('h1').textContent()).toBe('404');
    }
  );

  test('should not display "Go Back" link on page', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();

    await expect(startPage.goBackLink).toBeHidden();
  });

  test('should navigate to "choose template" page when start button clicked', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();
    await startPage.clickButtonByName('Start now');

    expect(page.url()).toContain(`${baseURL}/templates/choose-a-template-type`);
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtStartPage(page),
      id: '',
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertLoginLink(props);
    await assertFooterLinks(props);
    await assertGoBackLinkNotPresent(props);
  });
});
