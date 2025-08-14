import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePage } from '../pages/template-mgmt-base-page';

type CommonStepsProps = {
  page: TemplateMgmtBasePage;
  id?: string;
  baseURL?: string;
};

type FooterLinkSpec = {
  text: string;
  href: string;
};

const expectedFooterLinks: Record<string, FooterLinkSpec> = {
  acceptableUsePolicy: {
    text: 'Acceptable use policy',
    href: 'https://digital.nhs.uk/services/nhs-notify/acceptable-use-policy',
  },
  accessibilityStatement: {
    text: 'Accessibility statement',
    href: '/accessibility',
  },
  cookiesStatement: {
    text: 'Cookies',
    href: '/cookies',
  },
  privacyStatement: {
    text: 'Privacy',
    href: 'https://digital.nhs.uk/services/nhs-notify/transparency-notice',
  },
  termsAndConditions: {
    text: 'Terms and conditions',
    href: 'https://digital.nhs.uk/services/nhs-notify/terms-and-conditions',
  },
};

export function assertSkipToMainContent({ page, id }: CommonStepsProps) {
  return test.step('when user clicks "skip to main content", then page heading is focused', async () => {
    await page.loadPage(id);

    await page.page.keyboard.press('Tab');

    await expect(page.skipLink).toBeFocused();

    await page.page.keyboard.press('Enter');

    await expect(page.pageHeading).toBeFocused();
  });
}

export function assertHeaderWhenSignedOut({ page, id }: CommonStepsProps) {
  return test.step('when user is signed out, then header displays sign in link only', async () => {
    await page.loadPage(id);

    await expect(page.signInLink).toBeVisible();
    await expect(page.signOutLink).toBeHidden();
    await expect(page.headerAccountDisplayName).toBeHidden();
    await expect(page.headerAccountClientName).toBeHidden();
  });
}

export function assertHeaderWhenSignedIn({
  page,
  id,
  expectedDisplayName,
  expectedClientName,
}: CommonStepsProps & {
  expectedDisplayName: string;
  expectedClientName: string;
}) {
  return test.step('when user is signed in, then header shows display name and client name', async () => {
    await page.loadPage(id);

    await expect(page.signOutLink).toBeVisible();
    await expect(page.signInLink).toBeHidden();
    await expect(page.headerAccountDisplayName).toContainText(
      expectedDisplayName
    );
    await expect(page.headerAccountClientName).toContainText(
      expectedClientName
    );
  });
}

export function assertHeaderLogoLink({ page, id }: CommonStepsProps) {
  return test.step('header logo is visible, correctly labelled and structured', async () => {
    await page.loadPage(id);

    const logoLink = page.headerLogoLink;

    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/message-templates');
    await expect(logoLink).toHaveAttribute(
      'aria-label',
      'NHS Notify templates'
    );
    await expect(logoLink).toContainText('Notify');
    await expect(logoLink.locator('svg[role="img"] title')).toHaveText(
      'NHS logo'
    );
  });
}

export function assertClickHeaderLogoRedirectsToStartPage({
  page,
  id,
  baseURL,
}: CommonStepsProps) {
  return test.step('when user clicks header logo, they are redirected to start page', async () => {
    await assertHeaderLogoLink({ page, id });

    await page.headerLogoLink.click();

    await expect(page.page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
  });
}

export function assertSignInLink({ page, id }: CommonStepsProps) {
  return test.step('when user clicks "Sign in", then user is redirected to "sign in page"', async () => {
    await page.loadPage(id);

    const link = page.signInLink;

    await expect(link).toHaveAttribute(
      'href',
      '/auth?redirect=%2Ftemplates%2Fcreate-and-submit-templates'
    );
  });
}

export function assertSignOutLink({ page, id }: CommonStepsProps) {
  return test.step('"Sign out", should direct user to signout', async () => {
    await page.loadPage(id);

    const link = page.signOutLink;

    await expect(link).toHaveAttribute('href', '/auth/signout');
  });
}

export function assertHeaderNavigationLinks({
  page,
  id,
  routingEnabled,
}: CommonStepsProps & { routingEnabled: boolean }) {
  const description = routingEnabled
    ? 'Templates and Message plans links'
    : 'Templates link only';

  return test.step(`header shows ${description} when routing is ${routingEnabled ? 'enabled' : 'disabled'}`, async () => {
    await page.loadPage(id);

    const nav = page.headerNavigationLinks;

    await expect(nav.getByRole('link', { name: 'Templates' })).toBeVisible();

    const messagePlansLink = nav.getByRole('link', { name: 'Message plans' });

    if (routingEnabled) {
      await expect(messagePlansLink).toBeVisible();
    } else {
      await expect(messagePlansLink).toHaveCount(0);
    }
  });
}

export function assertGoBackLink({
  page,
  id,
  baseURL,
  expectedUrl,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back", then user is redirected to previous page', async () => {
    await page.loadPage(id);

    await page.goBackLink.click();

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}

export function assertGoBackLinkNotPresent({ page, id }: CommonStepsProps) {
  return test.step('should not display "Go Back" link on page', async () => {
    await page.loadPage(id);

    await expect(page.goBackLink).toBeHidden();
  });
}

export function assertFooterLinks({ page, id }: CommonStepsProps) {
  return test.step('when page loads, then Page Footer should have the correct links', async () => {
    await page.loadPage(id);

    const promises = Object.values(expectedFooterLinks).map((linkSpec) =>
      expect(
        page.page.getByRole('link', { name: linkSpec.text })
      ).toHaveAttribute('href', linkSpec.href)
    );

    await Promise.all(promises);
  });
}
