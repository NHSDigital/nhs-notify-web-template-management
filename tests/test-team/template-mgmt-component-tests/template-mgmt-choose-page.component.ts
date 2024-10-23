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

    await expect(page.locator('[class="nhsuk-radios__item"]')).toHaveText([
      'NHS App message',
      'Email',
      'Text message (SMS)',
      'Letter',
    ]);
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

      await chooseTemplatePage.navigateToChooseTemplatePage(
        sessionDataForRadioSelect.id
      );
      await TemplateMgmtChoosePage.checkRadioButton(page.getByLabel(label));
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

      await chooseTemplatePage.navigateToChooseTemplatePage(sessionData.id);

      expect(page.getByLabel(label)).toBeChecked();
    });
  }

  test('should not display "Go Back" link on page', async ({ page }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

    await expect(chooseTemplatePage.goBackLink).toBeHidden();
  });

  test('should navigate to error page if sessionId invalid', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);

    await chooseTemplatePage.navigateToChooseTemplatePage('invalid-sessionId');

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
  });

  test('Footer links exist and are visible', async ({ page }) => {
    const chooseTemplatePage = new TemplateMgmtChoosePage(page);
    await chooseTemplatePage.navigateToChooseTemplatePage(emptySessionData.id);

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
});
