import { test } from '@playwright/test';
import {
  assertHeaderWhenSignedOut,
  assertHeaderWhenSignedIn,
  assertHeaderNavigationLinksWhenSignedIn,
  assertHeaderNavigationLinksWhenSignedOut,
  assertSignInLink,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertClickHeaderLogoRedirectsToStartPage,
} from './template-mgmt-common.steps';
import { TemplateMgmtStartPage } from '../pages/template-mgmt-start-page';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { loginAsUser } from '../helpers/auth/login-as-user';

test.describe('Header component', () => {
  let userWithAllIdentityAttributes: TestUser;
  let userWithGivenAndFamilyNameOnly: TestUser;
  let userWithNoIdentityAttributes: TestUser;
  let userWithRoutingEnabled: TestUser;
  let userWithRoutingDisabled: TestUser;
  let userWithNoClient: TestUser;

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    userWithAllIdentityAttributes = await authHelper.getTestUser(
      testUsers.User1.userId
    ); // Client1: routing enabled, full identity
    userWithGivenAndFamilyNameOnly = await authHelper.getTestUser(
      testUsers.User2.userId
    ); // Client1: no preferred_username
    userWithNoIdentityAttributes = await authHelper.getTestUser(
      testUsers.User5.userId
    ); // Client1: no name claims
    userWithRoutingEnabled = userWithAllIdentityAttributes; // Client1: routing enabled, full identity
    userWithRoutingDisabled = await authHelper.getTestUser(
      testUsers.User3.userId
    ); // Client2: routing disabled
    userWithNoClient = await authHelper.getTestUser(testUsers.User6.userId); // Client: NONE
  });

  test.use({ storageState: { cookies: [], origins: [] } });

  test(`when user is signed out, header shows only logo and 'sign in' link`, async ({
    page,
    baseURL,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await assertHeaderLogoLink({ page: startPage });
    await assertHeaderWhenSignedOut({ page: startPage });
    await assertHeaderNavigationLinksWhenSignedOut({ page: startPage });
    await assertSignInLink({ page: startPage });
    await assertClickHeaderLogoRedirectsToStartPage({
      page: startPage,
      baseURL,
    });
  });

  test(`when user is signed in, header shows account information and 'sign out' link`, async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithAllIdentityAttributes, page);

    await assertHeaderLogoLink({ page: startPage });
    await assertHeaderWhenSignedIn({
      page: startPage,
      expectedDisplayName:
        userWithRoutingEnabled.identityAttributes?.preferred_username ?? '',
      expectedClientName: userWithRoutingEnabled.clientName ?? '',
    });
    await assertSignOutLink({ page: startPage });
  });

  test('when user has all identity attributes, header shows preferred username and client name', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithAllIdentityAttributes, page);

    await assertHeaderWhenSignedIn({
      page: startPage,
      expectedDisplayName:
        userWithRoutingEnabled.identityAttributes?.preferred_username ?? '',
      expectedClientName: userWithRoutingEnabled.clientName ?? '',
    });
    await assertSignOutLink({ page: startPage });
  });

  test('when user has only given and family name, header shows full name and client name', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithGivenAndFamilyNameOnly, page);

    const expectedName = `${userWithGivenAndFamilyNameOnly.identityAttributes?.given_name} ${userWithGivenAndFamilyNameOnly.identityAttributes?.family_name}`;

    await assertHeaderWhenSignedIn({
      page: startPage,
      expectedDisplayName: expectedName,
      expectedClientName: userWithGivenAndFamilyNameOnly.clientName ?? '',
    });
  });

  test('when user has no identity attributes, header falls back to email', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithNoIdentityAttributes, page);

    await assertHeaderWhenSignedIn({
      page: startPage,
      expectedDisplayName: userWithNoIdentityAttributes.email,
      expectedClientName: userWithNoIdentityAttributes.clientName ?? '',
    });
  });

  // TODO: CCM-11148 Enable test once routing flag is implemented
  test.skip('when user belongs to client with routing enabled, header shows both Templates and Message plans links', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithRoutingEnabled, page);

    await assertHeaderNavigationLinksWhenSignedIn({
      page: startPage,
      routingEnabled: true,
    });
  });

  test('when user belongs to client with routing disabled, header shows Templates link only', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithRoutingDisabled, page);

    await assertHeaderNavigationLinksWhenSignedIn({
      page: startPage,
      routingEnabled: false,
    });
  });

  test('when user belongs to no client, header still renders correctly without client name', async ({
    page,
  }) => {
    const startPage = new TemplateMgmtStartPage(page);

    await loginAsUser(userWithNoClient, page);

    await assertHeaderWhenSignedIn({
      page: startPage,
      expectedDisplayName:
        userWithNoClient.identityAttributes?.preferred_username ?? '',
      expectedClientName: '',
    });

    await assertHeaderNavigationLinksWhenSignedIn({
      page: startPage,
      routingEnabled: false,
    });
  });
});
