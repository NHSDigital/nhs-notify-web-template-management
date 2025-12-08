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
import { RoutingChooseTextMessageTemplatePage } from 'pages/routing/sms/choose-sms-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = '906372fd-971c-484e-8d32-0225bd561762';

function createMessagePlans(user: TestUser) {
  return {
    SMS_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,SMS'
    ).dbEntry,
    NON_SMS_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    SMS1: TemplateFactory.createSmsTemplate(
      randomUUID(),
      user,
      'Submitted sms template 1'
    ),
    SMS2: TemplateFactory.createSmsTemplate(
      randomUUID(),
      user,
      'Submitted sms template 2'
    ),
    SMS3: TemplateFactory.createSmsTemplate(
      randomUUID(),
      user,
      'Submitted sms template 3'
    ),
    APP: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'App template'
    ),
  };
}

test.describe('Routing - Choose sms template page', () => {
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
      page: new RoutingChooseTextMessageTemplatePage(page),
      id: messagePlans.SMS_ROUTING_CONFIG.id,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkTopNotPresent(props);
    await assertBackLinkBottom({
      ...props,
      expectedUrl: `templates/message-plans/choose-templates/${messagePlans.SMS_ROUTING_CONFIG.id}`,
    });
  });

  test('loads the choose sms template page for a message plan with an sms channel', async ({
    page,
    baseURL,
  }) => {
    const chooseSmsTemplatePage = new RoutingChooseTextMessageTemplatePage(
      page
    );
    await chooseSmsTemplatePage.loadPage(messagePlans.SMS_ROUTING_CONFIG.id);
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-text-message-template/${messagePlans.SMS_ROUTING_CONFIG.id}`
    );

    await test.step('displays list of sms templates to choose from', async () => {
      await assertChooseTemplatePageWithTemplatesAvailable({
        page: chooseSmsTemplatePage,
      });

      await expect(chooseSmsTemplatePage.messagePlanName).toHaveText(
        messagePlans.SMS_ROUTING_CONFIG.name
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

      for (const template of [templates.SMS1, templates.SMS2, templates.SMS3]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = chooseSmsTemplatePage.getRadioButton(template.id);
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        const previewLink = chooseSmsTemplatePage.getPreviewLink(template.id);
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/templates/message-plans/choose-text-message-template/${messagePlans.SMS_ROUTING_CONFIG.id}/preview-template/${template.id}`
        );
      }

      await expect(table.getByText(templates.APP.name)).toBeHidden();

      const submitButton = chooseSmsTemplatePage.saveAndContinueButton;
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Save and continue');

      await expect(chooseSmsTemplatePage.backLinkBottom).toBeVisible();
      await expect(chooseSmsTemplatePage.backLinkBottom).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-templates/${messagePlans.SMS_ROUTING_CONFIG.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await chooseSmsTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-text-message-template/${messagePlans.SMS_ROUTING_CONFIG.id}`
      );

      await expect(chooseSmsTemplatePage.errorSummary).toBeVisible();
      await expect(chooseSmsTemplatePage.errorSummaryList).toHaveText([
        'Choose a text message (SMS) template',
      ]);
    });

    await test.step('submits selected template and navigates to choose templates page', async () => {
      await chooseSmsTemplatePage.loadPage(messagePlans.SMS_ROUTING_CONFIG.id);

      await chooseSmsTemplatePage.getRadioButton(templates.SMS2.id).check();
      await chooseSmsTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${messagePlans.SMS_ROUTING_CONFIG.id}`
      );
    });

    await test.step('pre-selects previously selected template', async () => {
      await chooseSmsTemplatePage.loadPage(messagePlans.SMS_ROUTING_CONFIG.id);

      await assertChooseTemplatePageWithPreviousSelection({
        page: chooseSmsTemplatePage,
      });

      await expect(chooseSmsTemplatePage.messagePlanName).toHaveText(
        messagePlans.SMS_ROUTING_CONFIG.name
      );

      await expect(
        chooseSmsTemplatePage.previousSelectionDetails
      ).toContainText('Previously selected template');
      await expect(
        chooseSmsTemplatePage.previousSelectionDetails
      ).toContainText(templates.SMS2.name);

      const selectedRadio = chooseSmsTemplatePage.getRadioButton(
        templates.SMS2.id
      );
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseSmsTemplatePage = new RoutingChooseTextMessageTemplatePage(
        page
      );

      await chooseSmsTemplatePage.loadPage(notFoundMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseSmsTemplatePage = new RoutingChooseTextMessageTemplatePage(
        page
      );

      await chooseSmsTemplatePage.loadPage(invalidMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an sms channel', async ({
      page,
      baseURL,
    }) => {
      const chooseSmsTemplatePage = new RoutingChooseTextMessageTemplatePage(
        page
      );

      await chooseSmsTemplatePage.loadPage(
        messagePlans.NON_SMS_ROUTING_CONFIG.id
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
