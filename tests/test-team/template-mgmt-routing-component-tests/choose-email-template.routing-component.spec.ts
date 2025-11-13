import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertGoBackLinkNotPresent,
} from '../helpers/template-mgmt-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { ChooseEmailTemplatePage } from 'pages/routing/choose-email-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = randomUUID();

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
    // Seed templates later to test empty page
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new ChooseEmailTemplatePage(page),
      id: messagePlans.EMAIL_ROUTING_CONFIG.id,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('loads the choose email template page for a message plan with an email channel', async ({
    page,
    baseURL,
  }) => {
    const chooseEmailTemplatePage = new ChooseEmailTemplatePage(page);
    await chooseEmailTemplatePage.loadPage(
      messagePlans.EMAIL_ROUTING_CONFIG.id
    );
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-email-template/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
    );

    await test.step('loads page when no templates exist', async () => {
      await expect(chooseEmailTemplatePage.pageHeading).toHaveText(
        'Choose an email template'
      );

      await expect(
        page.getByText(messagePlans.EMAIL_ROUTING_CONFIG.name)
      ).toBeVisible();

      await expect(
        page.getByText('You do not have any templates yet.')
      ).toBeVisible();

      const goToTemplatesLink = page.getByRole('link', {
        name: 'Go to templates',
      });
      await expect(goToTemplatesLink).toBeVisible();
      await expect(goToTemplatesLink).toHaveAttribute(
        'href',
        '/templates/message-templates'
      );

      const goBackLink = page.getByRole('link', { name: 'Go back' });
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/templates/message-plans/overview/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
      );

      await expect(page.getByTestId('submit-button')).toBeHidden();
    });

    await templateStorageHelper.seedTemplateData(Object.values(templates));
    await chooseEmailTemplatePage.loadPage(
      messagePlans.EMAIL_ROUTING_CONFIG.id
    );

    await test.step('displays list of email templates to choose from', async () => {
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

      for (const template of [
        templates.EMAIL1,
        templates.EMAIL2,
        templates.EMAIL3,
      ]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = table.getByTestId(`${template.id}-radio`);
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        await expect(
          table.getByTestId(`${template.id}-template-type`)
        ).toHaveText('Email');

        const previewLink = table.getByTestId(`${template.id}-preview-link`);
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/message-plans/choose-email-template/${messagePlans.EMAIL_ROUTING_CONFIG.id}/preview-template/${template.id}`
        );
      }

      await expect(table.getByText(templates.APP.name)).toBeHidden();

      const submitButton = page.getByTestId('submit-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveAttribute('name', 'Save and continue');

      const goBackLink = page.getByRole('link', { name: 'Go back' });
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/message-plans/overview/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-email-template/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
      );

      await expect(chooseEmailTemplatePage.errorSummary).toBeVisible();
      await expect(chooseEmailTemplatePage.errorSummaryList).toHaveText([
        'Choose an email template',
      ]);
    });

    await test.step('pre-selects previously selected template', async () => {
      await page.getByTestId(`${templates.EMAIL2.id}-radio`).check();
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/overview/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
      );

      await chooseEmailTemplatePage.loadPage(
        messagePlans.EMAIL_ROUTING_CONFIG.id
      );

      // Check summary list is present and displays the name of the previously selected template
      const summaryList = page.getByTestId('previous-selection-summary');
      await expect(summaryList).toBeVisible();
      await expect(summaryList).toContainText('Previously selected template');
      await expect(summaryList).toContainText(templates.EMAIL2.name);

      const selectedRadio = page.getByTestId(`${templates.EMAIL2.id}-radio`);
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseEmailTemplatePage = new ChooseEmailTemplatePage(page);

      await chooseEmailTemplatePage.loadPage(notFoundMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseEmailTemplatePage = new ChooseEmailTemplatePage(page);

      await chooseEmailTemplatePage.loadPage(invalidMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an email channel', async ({
      page,
      baseURL,
    }) => {
      const chooseEmailTemplatePage = new ChooseEmailTemplatePage(page);

      await chooseEmailTemplatePage.loadPage(
        messagePlans.NON_EMAIL_ROUTING_CONFIG.id
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
