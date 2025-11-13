/* eslint-disable sonarjs/no-commented-code */
import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertGoBackLinkNotPresent,
} from '../../helpers/template-mgmt-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingChooseNhsAppTemplatePage } from 'pages/routing/nhs-app/choose-nhs-app-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = '67027ba8-00e4-49e7-8e3c-6501a0ee6884';

function createMessagePlans(user: TestUser) {
  return {
    APP_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
    ).dbEntry,
    NON_APP_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    APP1: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'NHS App template 1'
    ),
    APP2: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'NHS App template 2'
    ),
    APP3: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'NHS App template 3'
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template'
    ),
  };
}

test.describe('Routing - Choose NHS app template page', () => {
  let messagePlans: ReturnType<typeof createMessagePlans>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    messagePlans = createMessagePlans(user);
    templates = createTemplates(user);

    await routingConfigStorageHelper.seed(Object.values(messagePlans));
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseNhsAppTemplatePage(page),
      id: messagePlans.APP_ROUTING_CONFIG.id,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('loads the choose NHS app template page for a message plan with an NHS app channel', async ({
    page,
    baseURL,
  }) => {
    const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page);
    await chooseNhsAppTemplatePage.loadPage(messagePlans.APP_ROUTING_CONFIG.id);
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${messagePlans.APP_ROUTING_CONFIG.id}`
    );

    await test.step('displays list of NHS app templates to choose from', async () => {
      const table = page.getByTestId('channel-templates-table');
      await expect(table).toBeVisible();
      await expect(
        table.getByTestId('channel-templates-table-header-template-select')
      ).toHaveText('Select');
      await expect(
        table.getByTestId('channel-templates-table-header-template-name')
      ).toHaveText('Name');
      await expect(
        table.getByTestId('channel-templates-table-header-template-type')
      ).toHaveText('Type');
      await expect(
        table.getByTestId('channel-templates-table-header-template-last-edited')
      ).toHaveText('Last edited');
      await expect(
        table.getByTestId('channel-templates-table-header-template-action')
      ).toHaveText('');

      for (const template of [templates.APP1, templates.APP2, templates.APP3]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = table.getByTestId(`${template.id}-radio`);
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        const previewLink = table.getByTestId(`${template.id}-preview-link`);
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/templates/message-plans/choose-nhs-app-template/${messagePlans.APP_ROUTING_CONFIG.id}/preview-template/${template.id}`
        );
      }

      const submitButton = page.getByTestId('submit-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Save and continue');

      await expect(table.getByText(templates.EMAIL.name)).toBeHidden();

      const goBackLink = page.getByRole('link', { name: 'Go back' });
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-templates/${messagePlans.APP_ROUTING_CONFIG.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-nhs-app-template/${messagePlans.APP_ROUTING_CONFIG.id}`
      );

      await expect(chooseNhsAppTemplatePage.errorSummary).toBeVisible();
      await expect(chooseNhsAppTemplatePage.errorSummaryList).toHaveText([
        'Choose an NHS App template',
      ]);
    });

    await test.step('submits selected template and navigates to choose templates page', async () => {
      await chooseNhsAppTemplatePage.loadPage(
        messagePlans.APP_ROUTING_CONFIG.id
      );

      await page.getByTestId(`${templates.APP2.id}-radio`).check();
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${messagePlans.APP_ROUTING_CONFIG.id}`
      );
    });

    await test.step('pre-selects previously selected template', async () => {
      await chooseNhsAppTemplatePage.loadPage(
        messagePlans.APP_ROUTING_CONFIG.id
      );

      // Check summary list is present and displays the name of the previously selected template
      const summaryList = page.getByTestId('previous-selection-summary');
      await expect(summaryList).toBeVisible();
      await expect(summaryList).toContainText('Previously selected template');
      await expect(summaryList).toContainText(templates.APP2.name);

      const selectedRadio = page.getByTestId(`${templates.APP2.id}-radio`);
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(
        page
      );

      await chooseNhsAppTemplatePage.loadPage(notFoundMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(
        page
      );

      await chooseNhsAppTemplatePage.loadPage(invalidMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an NHS app channel', async ({
      page,
      baseURL,
    }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(
        page
      );

      await chooseNhsAppTemplatePage.loadPage(
        messagePlans.NON_APP_ROUTING_CONFIG.id
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
