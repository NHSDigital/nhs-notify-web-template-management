import { test, expect } from '@playwright/test';
import { TemplateMgmtDeleteErrorPage } from '../pages/template-mgmt-delete-error-page';
import { TemplateMgmtDeletePage } from '../pages/template-mgmt-delete-page';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertAndClickBackLinkBottom,
} from '../helpers/template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { Template, RoutingConfigDbEntry } from '../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { randomUUID } from 'node:crypto';

const templateIds = {
  TEMPLATE_IN_MESSAGE_PLAN: randomUUID(),
  TEMPLATE_NOT_REFERENCED: randomUUID(),
  TEMPLATE_OTHER: randomUUID(),
  TEMPLATE_NOT_FOUND: randomUUID(),
};

const routingConfigIds = {
  MESSAGE_PLAN_WITH_DEFAULT: randomUUID(),
  MESSAGE_PLAN_WITH_CONDITIONAL: randomUUID(),
  MESSAGE_PLAN_WITHOUT_TEMPLATE: randomUUID(),
};

function createTemplates(user: TestUser) {
  return {
    TEMPLATE_IN_MESSAGE_PLAN: TemplateFactory.uploadLetterTemplate(
      templateIds.TEMPLATE_IN_MESSAGE_PLAN,
      user,
      'Template in multiple plans'
    ),
    TEMPLATE_NOT_REFERENCED: TemplateFactory.uploadLetterTemplate(
      templateIds.TEMPLATE_NOT_REFERENCED,
      user,
      'Template not in any plan'
    ),
    TEMPLATE_OTHER: TemplateFactory.createNhsAppTemplate(
      templateIds.TEMPLATE_OTHER,
      user,
      'App Template'
    ),
  };
}

function createRoutingConfigs(
  user: TestUser
): Record<keyof typeof routingConfigIds, RoutingConfigDbEntry> {
  return {
    MESSAGE_PLAN_WITH_DEFAULT: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL,SMS,LETTER',
      {
        id: routingConfigIds.MESSAGE_PLAN_WITH_DEFAULT,
        name: 'Message Plan 1',
      }
    ).addTemplate('LETTER', templateIds.TEMPLATE_IN_MESSAGE_PLAN).dbEntry,
    MESSAGE_PLAN_WITH_CONDITIONAL: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL,SMS,LETTER',
      {
        id: routingConfigIds.MESSAGE_PLAN_WITH_CONDITIONAL,
        name: 'Message Plan 2',
      }
    )
      .addTemplate('NHSAPP', templateIds.TEMPLATE_OTHER)
      .addAccessibleFormatTemplate('x1', templateIds.TEMPLATE_IN_MESSAGE_PLAN)
      .dbEntry,
    MESSAGE_PLAN_WITHOUT_TEMPLATE: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL,SMS,LETTER',
      {
        id: routingConfigIds.MESSAGE_PLAN_WITHOUT_TEMPLATE,
        name: 'Plan Without Template',
      }
    ).addTemplate('NHSAPP', templateIds.TEMPLATE_OTHER).dbEntry,
  };
}

test.describe('Delete Template Error Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  const routingConfigStorageHelper = new RoutingConfigStorageHelper();

  let templates: Record<
    Exclude<keyof typeof templateIds, 'TEMPLATE_NOT_FOUND'>,
    Template
  >;
  let routingConfigs: Record<
    keyof typeof routingConfigIds,
    RoutingConfigDbEntry
  >;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    templates = createTemplates(user);
    routingConfigs = createRoutingConfigs(user);

    await templateStorageHelper.seedTemplateData(Object.values(templates));
    await routingConfigStorageHelper.seed(Object.values(routingConfigs));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
    await routingConfigStorageHelper.deleteSeeded();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtDeleteErrorPage(page).setPathParam(
        'templateId',
        templates.TEMPLATE_IN_MESSAGE_PLAN.id
      ),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertAndClickBackLinkBottom({
      ...props,
      expectedUrl: 'templates/message-templates',
    });
  });

  test('should land on "Delete Template Error" page when trying to delete a template that is referenced in message plans', async ({
    page,
    baseURL,
  }) => {
    const deletePage = new TemplateMgmtDeletePage(page).setPathParam(
      'templateId',
      templates.TEMPLATE_IN_MESSAGE_PLAN.id
    );

    await deletePage.loadPage();

    await deletePage.confirmButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/delete-template-error/${templates.TEMPLATE_IN_MESSAGE_PLAN.id}`,
      { timeout: 20_000 }
    );

    const deleteErrorPage = new TemplateMgmtDeleteErrorPage(page);

    await expect(deleteErrorPage.pageHeading).toHaveText(
      `You cannot delete the template '${templates.TEMPLATE_IN_MESSAGE_PLAN.name}'`
    );
  });

  test('should display message plans that reference the named template (default and conditional) and exclude plans that do not', async ({
    page,
  }) => {
    const deleteTemplateErrorPage = new TemplateMgmtDeleteErrorPage(
      page
    ).setPathParam('templateId', templates.TEMPLATE_IN_MESSAGE_PLAN.id);

    await deleteTemplateErrorPage.loadPage();

    await expect(deleteTemplateErrorPage.pageHeading).toHaveText(
      `You cannot delete the template '${templates.TEMPLATE_IN_MESSAGE_PLAN.name}'`
    );

    const messagePlanList = deleteTemplateErrorPage.messagePlanList;
    await expect(messagePlanList).toBeVisible();

    await expect(messagePlanList.locator('li')).toHaveCount(2);

    const listItems = await messagePlanList.locator('li').all();
    const planNames = await Promise.all(
      listItems.map((item) => item.textContent())
    );

    expect(planNames).toContain(routingConfigs.MESSAGE_PLAN_WITH_DEFAULT.name);
    expect(planNames).toContain(
      routingConfigs.MESSAGE_PLAN_WITH_CONDITIONAL.name
    );
    expect(planNames).not.toContain(
      routingConfigs.MESSAGE_PLAN_WITHOUT_TEMPLATE.name
    );
  });

  test('should redirect to templates page when template is not found', async ({
    page,
    baseURL,
  }) => {
    const deleteTemplateErrorPage = new TemplateMgmtDeleteErrorPage(
      page
    ).setPathParam('templateId', templateIds.TEMPLATE_NOT_FOUND);

    await deleteTemplateErrorPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
  });

  test('should redirect to templates page when template is not referenced in any message plans', async ({
    page,
    baseURL,
  }) => {
    const deleteTemplateErrorPage = new TemplateMgmtDeleteErrorPage(
      page
    ).setPathParam('templateId', templates.TEMPLATE_NOT_REFERENCED.id);

    await deleteTemplateErrorPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
  });
});
