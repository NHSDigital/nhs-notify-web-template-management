import { test, expect } from '@playwright/test';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import { TestUserClient } from '../helpers/test-user-client';

const testUserEmail = 'start-page@nhs.net';
const testUserPassword = 'Test-Password1';

test.describe('Start Page', () => {
  const testUserClient = new TestUserClient();

  test.beforeAll(async () => {
    await testUserClient.createTestUser(testUserEmail, testUserPassword);
  });

  test.afterAll(async () => {
    await testUserClient.deleteTestUser(testUserEmail);
  });

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

  test('should not display "Go Back" link on page', async ({ page }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.navigateToStartPage();

    await expect(startPage.goBackLink).toBeHidden();
  });

  test('should navigate to "choose template" page when start button clicked', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await startPage.signIn(testUserEmail, testUserPassword);

    await startPage.navigateToStartPage();
    await startPage.clickStartButton();

    await expect(page).toHaveURL(/\/templates\/choose-a-template-type\/.*/, { timeout: 10000 });
  });
});

test('Footer links exist and are visible', async ({ page }) => {
  const startPage = new TemplateMgmtStartPage(page);
  await startPage.navigateToStartPage();

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
