import { test, expect } from '@playwright/test';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import { assertSignOutLink } from './template-mgmt-common.steps';

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
    expect(await startPage.pageHeader.textContent()).toBe(
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

  test('should display sign out link', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await assertSignOutLink({
      page: startPage,
      id: '/templates/create-and-submit-templates',
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

    expect(page.url()).toContain(`${baseURL}/templates/manage-templates`);
  });
});

test('Footer links exist and are visible', async ({ page }) => {
  const startPage = new TemplateMgmtStartPage(page);
  await startPage.loadPage();

  const footerLinks = [
    {
      name: 'Accessibility statement',
      selector: 'a[data-testid="accessibility-statement-link"]',
      href: '/accessibility',
    },
    {
      name: 'Contact Us',
      selector: 'a[data-testid="contact-us-link"]',
      href: '#',
    },
    {
      name: 'Cookies',
      selector: 'a[data-testid="cookies-link"]',
      href: '#',
    },
    {
      name: 'Privacy Policy',
      selector: 'a[data-testid="privacy-policy-link"]',
      href: '#',
    },
    {
      name: 'Terms and Conditions',
      selector: 'a[data-testid="terms-and-conditions-link"]',
      href: '#',
    },
  ];

  await Promise.all(
    footerLinks.map(async (link) => {
      const linkLocator = page.locator(link.selector);
      const href = await linkLocator.getAttribute('href');
      expect(linkLocator, `${link.name} should be visible`).toBeVisible();
      expect(href, `${link.name} should have href ${link.href}`).toBe(
        link.href
      );
    })
  );
});
