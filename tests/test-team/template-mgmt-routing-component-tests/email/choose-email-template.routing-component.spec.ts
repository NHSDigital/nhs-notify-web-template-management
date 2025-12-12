import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkTopNotPresent,
  assertAndClickBackLinkBottom,
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
import { RoutingChooseEmailTemplatePage } from 'pages/routing/email/choose-email-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = '48f86a39-b43c-4859-ae0b-4be4826f3a0f';

function createMessagePlans(user: TestUser) {
  return {
    EMAIL_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL'
    ).dbEntry,
    NON_EMAIL_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    EMAIL1: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template 1'
    ),
    EMAIL2: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template 2'
    ),
    EMAIL3: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template 3'
    ),
    APP: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'App template'
    ),
  };
}

test.describe('Routing - Choose email template page', () => {
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
      page: new RoutingChooseEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
        .setSearchParam(
          'lockNumber',
          String(messagePlans.EMAIL_ROUTING_CONFIG.lockNumber)
        ),

      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkTopNotPresent(props);
    await assertAndClickBackLinkBottom({
      ...props,
      expectedUrl: `templates/message-plans/choose-templates/${messagePlans.EMAIL_ROUTING_CONFIG.id}`,
    });
  });

  test('loads the choose email template page for a message plan with an email channel', async ({
    page,
    baseURL,
  }) => {
    const plan = messagePlans.EMAIL_ROUTING_CONFIG;
    const chooseEmailTemplatePage = new RoutingChooseEmailTemplatePage(page)
      .setPathParam('messagePlanId', plan.id)
      .setSearchParam('lockNumber', String(plan.lockNumber));

    await chooseEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-email-template/${plan.id}?lockNumber=${plan.lockNumber}`
    );

    await test.step('displays list of email templates to choose from', async () => {
      await assertChooseTemplatePageWithTemplatesAvailable({
        page: chooseEmailTemplatePage,
      });

      await expect(chooseEmailTemplatePage.messagePlanName).toHaveText(
        messagePlans.EMAIL_ROUTING_CONFIG.name
      );

      const table = chooseEmailTemplatePage.templatesTable;
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

      for (const template of [
        templates.EMAIL1,
        templates.EMAIL2,
        templates.EMAIL3,
      ]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = chooseEmailTemplatePage.getRadioButton(template.id);
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        const previewLink = chooseEmailTemplatePage.getPreviewLink(template.id);
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/templates/message-plans/choose-email-template/${plan.id}/preview-template/${template.id}`
        );
      }

      await expect(table.getByText(templates.APP.name)).toBeHidden();

      const submitButton = chooseEmailTemplatePage.saveAndContinueButton;
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Save and continue');

      const goBackLink = chooseEmailTemplatePage.backLinkBottom;
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await chooseEmailTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-email-template/${plan.id}?lockNumber=${plan.lockNumber}`
      );

      await expect(chooseEmailTemplatePage.errorSummary).toBeVisible();
      await expect(chooseEmailTemplatePage.errorSummaryList).toHaveText([
        'Choose an email template',
      ]);
    });

    await test.step('submits selected template and navigates to choose templates page', async () => {
      await chooseEmailTemplatePage.loadPage();

      await chooseEmailTemplatePage.getRadioButton(templates.EMAIL2.id).check();
      await chooseEmailTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('pre-selects previously selected template', async () => {
      await chooseEmailTemplatePage.loadPage();

      await assertChooseTemplatePageWithPreviousSelection({
        page: chooseEmailTemplatePage,
      });

      await expect(chooseEmailTemplatePage.messagePlanName).toHaveText(
        messagePlans.EMAIL_ROUTING_CONFIG.name
      );

      await expect(
        chooseEmailTemplatePage.previousSelectionDetails
      ).toContainText('Previously selected template');
      await expect(
        chooseEmailTemplatePage.previousSelectionDetails
      ).toContainText(templates.EMAIL2.name);

      const selectedRadio = chooseEmailTemplatePage.getRadioButton(
        templates.EMAIL2.id
      );
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseEmailTemplatePage = new RoutingChooseEmailTemplatePage(page)
        .setPathParam('messagePlanId', notFoundMessagePlanId)
        .setSearchParam('lockNumber', '42');

      await chooseEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseEmailTemplatePage = new RoutingChooseEmailTemplatePage(page)
        .setPathParam('messagePlanId', invalidMessagePlanId)
        .setSearchParam('lockNumber', '42');

      await chooseEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an email channel', async ({
      page,
      baseURL,
    }) => {
      const chooseEmailTemplatePage = new RoutingChooseEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.NON_EMAIL_ROUTING_CONFIG.id)
        .setSearchParam(
          'lockNumber',
          String(messagePlans.NON_EMAIL_ROUTING_CONFIG.lockNumber)
        );

      await chooseEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });

  test.describe('redirects to choose templates page', () => {
    test('when no lockNumber in url', async ({ page, baseURL }) => {
      const chooseTemplatePage = new RoutingChooseEmailTemplatePage(
        page
      ).setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id);

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
      );
    });
  });
});
