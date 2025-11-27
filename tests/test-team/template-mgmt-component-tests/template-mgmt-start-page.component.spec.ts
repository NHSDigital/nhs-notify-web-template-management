import { test, expect } from '@playwright/test';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertClickHeaderLogoRedirectsToStartPage,
  assertSignOutLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';

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
    await expect(startPage.pageHeading).toHaveText(
      'Create and submit a template to NHS Notify'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtStartPage(page),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertClickHeaderLogoRedirectsToStartPage(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertGoBackLinkNotPresent(props);
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
    await startPage.clickHeaderLogoLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
    await expect(startPage.pageHeading).toHaveText(
      'Create and submit a template to NHS Notify'
    );
  });

  test('should display sign out link', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await assertSignOutLink({
      page: startPage,
    });
  });

  test('should not display "Go Back" link on page', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();

    await expect(startPage.goBackLink).toBeHidden();
  });

  test('should navigate to "manage template" page when start button clicked', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.loadPage();
    await startPage.clickStartButton();

    expect(page.url()).toContain(`${baseURL}/templates/message-templates`);
  });
});
