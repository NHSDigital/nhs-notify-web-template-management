import { test, expect } from '@playwright/test';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';

test.describe('Start Page', () => {
  test('should land on start page when navigating to "/templates/create-and-submit-templates"', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
    expect(await startPage.pageHeader.textContent()).toBe(
      'Create and submit a template to NHS Notify'
    );
  });

  test('should display correct list of template types', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();

    await expect(startPage.listOfTemplates.getByRole('listitem')).toHaveText(
      TemplateMgmtStartPage.templateOptions
    );
  });

  test('should navigate to start page when "notify banner link" clicked', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();
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

      await startPage.navigateToStartPage();
      await startPage.clickLoginLink();

      await expect(page).toHaveURL(`${baseURL}/templates`);

      expect(await page.locator('h1').textContent()).toBe('404');
    }
  );

  test('should not display "Go Back" link on page', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();

    await expect(startPage.goBackLink).toBeHidden();
  });

  test('should navigate to "choose template" page when start button clicked', async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();
    await startPage.clickStartButton();

    expect(page.url()).toContain(
      `${baseURL}/templates/choose-a-template-type/`
    );
  });
});

test.only('Footer links exist and are visible', async ({ page }) => {
  const startPage = new TemplateMgmtStartPage(page);
  await startPage.navigateToStartPage();

  const footerLinks = [
    {
      name: 'Accessibility statement',
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

  for (const link of footerLinks) {
    const element = page.locator(link.selector);
    // eslint-disable-next-line no-await-in-loop
    await expect(element, `${link.name} should be visible`).toBeVisible();
  }
});