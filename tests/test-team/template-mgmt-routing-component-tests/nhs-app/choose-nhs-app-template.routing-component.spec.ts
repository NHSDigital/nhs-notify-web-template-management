/* eslint-disable sonarjs/no-commented-code */
import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkTopNotPresent,
  assertBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import {
  assertChooseTemplatePageWithPreviousSelection,
  assertChooseTemplatePageWithTemplatesAvailable,
} from '../routing-common.steps';
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
      page: new RoutingChooseNhsAppTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
        .setSearchParam(
          'lockNumber',
          String(messagePlans.APP_ROUTING_CONFIG.lockNumber)
        ),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom({
      ...props,
      expectedUrl: `/templates/message-plans/choose-templates/${messagePlans.APP_ROUTING_CONFIG.id}`,
    });
    await assertBackLinkTopNotPresent(props);
  });

  test('loads the choose NHS app template page for a message plan with an NHS app channel', async ({
    page,
    baseURL,
  }) => {
    const plan = messagePlans.APP_ROUTING_CONFIG;
    const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page)
      .setPathParam('messagePlanId', plan.id)
      .setSearchParam('lockNumber', String(plan.lockNumber));

    await chooseNhsAppTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${plan.id}?lockNumber=${plan.lockNumber}`
    );

    await test.step('displays list of NHS app templates to choose from', async () => {
      await assertChooseTemplatePageWithTemplatesAvailable({
        page: chooseNhsAppTemplatePage,
      });

      await expect(chooseNhsAppTemplatePage.messagePlanName).toHaveText(
        messagePlans.APP_ROUTING_CONFIG.name
      );

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

        const radioButton = chooseNhsAppTemplatePage.getRadioButton(
          template.id
        );
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        const previewLink = chooseNhsAppTemplatePage.getPreviewLink(
          template.id
        );
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/templates/message-plans/choose-nhs-app-template/${plan.id}/preview-template/${template.id}`
        );
      }

      const submitButton = chooseNhsAppTemplatePage.saveAndContinueButton;
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Save and continue');

      await expect(table.getByText(templates.EMAIL.name)).toBeHidden();

      await expect(chooseNhsAppTemplatePage.backLinkBottom).toBeVisible();
      await expect(chooseNhsAppTemplatePage.backLinkBottom).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await chooseNhsAppTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-nhs-app-template/${plan.id}?lockNumber=${plan.lockNumber}`
      );

      await expect(chooseNhsAppTemplatePage.errorSummary).toBeVisible();
      await expect(chooseNhsAppTemplatePage.errorSummaryList).toHaveText([
        'Choose an NHS App template',
      ]);
    });

    await test.step('submits selected template and navigates to choose templates page', async () => {
      await chooseNhsAppTemplatePage.loadPage();

      await chooseNhsAppTemplatePage.getRadioButton(templates.APP2.id).check();
      await chooseNhsAppTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('pre-selects previously selected template', async () => {
      await chooseNhsAppTemplatePage.loadPage();

      await assertChooseTemplatePageWithPreviousSelection({
        page: chooseNhsAppTemplatePage,
      });

      await expect(chooseNhsAppTemplatePage.messagePlanName).toHaveText(
        messagePlans.APP_ROUTING_CONFIG.name
      );

      await expect(
        chooseNhsAppTemplatePage.previousSelectionDetails
      ).toContainText('Previously selected template');
      await expect(
        chooseNhsAppTemplatePage.previousSelectionDetails
      ).toContainText(templates.APP2.name);

      const selectedRadio = chooseNhsAppTemplatePage.getRadioButton(
        templates.APP2.id
      );
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page)
        .setPathParam('messagePlanId', notFoundMessagePlanId)
        .setSearchParam('lockNumber', '42');

      await chooseNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page)
        .setPathParam('messagePlanId', invalidMessagePlanId)
        .setSearchParam('lockNumber', '42');

      await chooseNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an NHS app channel', async ({
      page,
      baseURL,
    }) => {
      const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.NON_APP_ROUTING_CONFIG.id)
        .setSearchParam(
          'lockNumber',
          String(messagePlans.NON_APP_ROUTING_CONFIG.lockNumber)
        );

      await chooseNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });

  test.describe('redirects to choose templates page', () => {
    test('when no lockNumber in url', async ({ page, baseURL }) => {
      const chooseTemplatePage = new RoutingChooseNhsAppTemplatePage(
        page
      ).setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id);

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${messagePlans.APP_ROUTING_CONFIG.id}`
      );
    });
  });
});
