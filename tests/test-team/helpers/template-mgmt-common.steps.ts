import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from 'pages/template-mgmt-base-page-dynamic';
import type { TemplateMgmtBasePageNonDynamic } from 'pages/template-mgmt-base-page-non-dynamic';

type CommonStepsProps = {
  page: TemplateMgmtBasePageDynamic | TemplateMgmtBasePageNonDynamic;
  id?: string;
  baseURL?: string;
  search?: Record<string, string>;
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

export function assertSkipToMainContent({
  page,
  id,
  search,
}: CommonStepsProps) {
  return test.step('when user clicks "skip to main content", then page heading is focused', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await page.page.keyboard.press('Tab');

    await expect(page.skipLink).toHaveAttribute('href', '#maincontent');

    await expect(page.skipLink).toBeFocused();

    await page.page.keyboard.press('Enter');

    await expect(page.page.locator('#maincontent')).toBeVisible();

    // TODO: CCM-11939 Reinstate this assertion
    // eslint-disable-next-line sonarjs/no-commented-code
    // await expect(page.pageHeading).toBeFocused();
  });
}

export function assertHeaderWhenSignedOut({
  page,
  id,
  search,
}: CommonStepsProps) {
  return test.step('when user is signed out, then header displays sign in link only', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await expect(page.signInLink).toBeVisible();
    await expect(page.signOutLink).toBeHidden();
    await expect(page.headerAccountDisplayName).toBeHidden();
    await expect(page.headerAccountClientName).toBeHidden();
    await expect(page.headerNavigationLinks).toHaveCount(0);
  });
}

export function assertHeaderWhenSignedIn({
  page,
  id,
  expectedDisplayName,
  expectedClientName,
  search,
}: CommonStepsProps & {
  expectedDisplayName: string;
  expectedClientName: string;
}) {
  return test.step('when user is signed in, then header shows display name and client name', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await expect(page.signOutLink).toBeVisible();
    await expect(page.signInLink).toBeHidden();
    await expect(page.headerAccountDisplayName).toContainText(
      expectedDisplayName
    );
    // eslint-disable-next-line unicorn/prefer-ternary
    if (expectedClientName) {
      await expect(page.headerAccountClientName).toContainText(
        expectedClientName
      );
    } else {
      await expect(page.headerAccountClientName).toBeHidden();
    }
    await expect(page.headerNavigationLinks).toBeVisible();
  });
}

export function assertHeaderLogoLink({ page, id, search }: CommonStepsProps) {
  return test.step('header logo is visible, correctly labelled and structured', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    const logoLink = page.headerLogoLink;

    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute(
      'href',
      '/templates/message-templates'
    );
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
  search,
}: CommonStepsProps) {
  return test.step('when user clicks header logo, they are redirected to start page', async () => {
    await assertHeaderLogoLink({ page, id, search });

    await page.headerLogoLink.click();

    await expect(page.page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
  });
}

export function assertSignInLink({ page, id, search }: CommonStepsProps) {
  return test.step('when user clicks "Sign in", then user is redirected to "sign in page"', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    const link = page.signInLink;

    await expect(link).toHaveAttribute(
      'href',
      '/auth?redirect=%2Ftemplates%2Fcreate-and-submit-templates'
    );
  });
}

export function assertSignOutLink({ page, id, search }: CommonStepsProps) {
  return test.step('"Sign out", should direct user to signout', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    const link = page.signOutLink;

    await expect(link).toHaveAttribute('href', '/auth/signout');
  });
}

export function assertHeaderNavigationLinksWhenSignedIn({
  page,
  id,
  routingEnabled,
  search,
}: CommonStepsProps & { routingEnabled: boolean }) {
  const description = routingEnabled
    ? 'Templates and Message plans links'
    : 'Templates link only';

  return test.step(`header shows ${description} when routing is ${routingEnabled ? 'enabled' : 'disabled'}`, async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    const nav = page.headerNavigationLinks;

    await expect(nav.getByRole('link', { name: 'Templates' })).toBeVisible();

    const messagePlansLink = nav.getByRole('link', { name: 'Message plans' });

    await (routingEnabled
      ? await expect(messagePlansLink).toBeVisible()
      : await expect(messagePlansLink).toHaveCount(0));
  });
}

export function assertHeaderNavigationLinksWhenSignedOut({
  page,
  id,
  search,
}: CommonStepsProps) {
  return test.step('header does not display navigation links when signed out', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await expect(page.headerNavigationLinks).toHaveCount(0);
  });
}

export function assertGoBackLink({
  page,
  id,
  baseURL,
  expectedUrl,
  search,
}: CommonStepsProps & { expectedUrl: string }) {
  return test.step('when user clicks "Go back", then user is redirected to previous page', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await page.goBackLink.click();

    await page.page.waitForURL(`${baseURL}/${expectedUrl}`);

    await expect(page.page).toHaveURL(`${baseURL}/${expectedUrl}`);
  });
}

export function assertGoBackLinkNotPresent({
  page,
  id,
  search,
}: CommonStepsProps) {
  return test.step('should not display "Go Back" link on page', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    await expect(page.goBackLink).toBeHidden();
  });
}

export function assertFooterLinks({ page, id, search }: CommonStepsProps) {
  return test.step('when page loads, then Page Footer should have the correct links', async () => {
    await (page instanceof TemplateMgmtBasePageDynamic
      ? page.loadPage(id, search)
      : page.loadPage(search));

    const promises = Object.values(expectedFooterLinks).map((linkSpec) =>
      expect(
        page.page.getByRole('link', { name: linkSpec.text })
      ).toHaveAttribute('href', linkSpec.href)
    );

    await Promise.all(promises);
  });
}
