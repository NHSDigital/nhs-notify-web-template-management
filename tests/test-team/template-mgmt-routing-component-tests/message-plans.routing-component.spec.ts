import { test, expect } from '@playwright/test';
import { RoutingMessagePlansPage } from '../pages/routing-message-plans-page';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';
import { createAuthHelper, testUsers } from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { RoutingConfigDbEntry } from 'helpers/types';

type MessagePlansPageData = {
  draft: RoutingConfigDbEntry;
  production: RoutingConfigDbEntry;
  deleted: RoutingConfigDbEntry;
};

async function createRoutingConfigs(): Promise<MessagePlansPageData> {
  const authHelper = createAuthHelper();
  const user = await authHelper.getTestUser(testUsers.User1.userId);

  return {
    draft: {
      ...RoutingConfigFactory.create(user, { status: 'DRAFT' }).dbEntry,
    },
    production: {
      ...RoutingConfigFactory.create(user, { status: 'COMPLETED' }).dbEntry,
    },
    deleted: {
      ...RoutingConfigFactory.create(user, { status: 'DELETED' }).dbEntry,
    },
  };
}

test.describe('Message plans Page', () => {
  const routingStorageHelper = new RoutingConfigStorageHelper();
  let routingConfigs: MessagePlansPageData;

  test.beforeAll(async () => {
    routingConfigs = await createRoutingConfigs();
    await routingStorageHelper.seed(Object.values(routingConfigs));
  });

  test('should land on "Message plans" page when navigating to "/templates/message-plans" url', async ({
    page,
    baseURL,
  }) => {
    const messagePlanPage = new RoutingMessagePlansPage(page);

    await messagePlanPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);
    await expect(messagePlanPage.pageHeading).toHaveText('Message plans');
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingMessagePlansPage(page),
      id: '',
      baseURL,
      expectedUrl: 'templates/message-plans',
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLink(props);
  });
});
