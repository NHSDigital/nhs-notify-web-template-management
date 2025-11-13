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
import { ChooseStandardEnglishLetterTemplatePage } from 'pages/routing/choose-standard-english-letter-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = randomUUID();

function createMessagePlans(user: TestUser) {
  return {
    LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER'
    ).dbEntry,
    NON_LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    LETTER1: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template 1',
      'SUBMITTED'
    ),
    LETTER2: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template 2',
      'SUBMITTED'
    ),
    LETTER3: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template 3',
      'SUBMITTED'
    ),
    UNSUBMITTED_LETTER: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Unsubmitted letter template'
    ),
    FRENCH_LETTER: {
      ...TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        user,
        'French letter template',
        'SUBMITTED'
      ),
      language: 'fr',
    },
    ACCESSIBLE_LETTER: {
      ...TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        user,
        'Accessible letter template',
        'SUBMITTED'
      ),
      letterType: 'x1',
    },
    APP: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'App template'
    ),
  };
}

test.describe('Routing - Choose letter template page', () => {
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
      page: new ChooseStandardEnglishLetterTemplatePage(page),
      id: messagePlans.LETTER_ROUTING_CONFIG.id,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('loads the choose letter template page for a message plan with a letter channel', async ({
    page,
    baseURL,
  }) => {
    const chooseLetterTemplatePage =
      new ChooseStandardEnglishLetterTemplatePage(page);
    await chooseLetterTemplatePage.loadPage(
      messagePlans.LETTER_ROUTING_CONFIG.id
    );
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}`
    );

    await test.step('loads page when no templates exist', async () => {
      await expect(chooseLetterTemplatePage.pageHeading).toHaveText(
        'Choose a letter template'
      );

      await expect(
        page.getByText(messagePlans.LETTER_ROUTING_CONFIG.name)
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
        `/templates/message-plans/overview/${messagePlans.LETTER_ROUTING_CONFIG.id}`
      );

      await expect(page.getByTestId('submit-button')).toBeHidden();
    });

    await templateStorageHelper.seedTemplateData(Object.values(templates));
    await chooseLetterTemplatePage.loadPage(
      messagePlans.LETTER_ROUTING_CONFIG.id
    );

    await test.step('displays list of letter templates to choose from', async () => {
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
        templates.LETTER1,
        templates.LETTER2,
        templates.LETTER3,
      ]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = table.getByTestId(`${template.id}-radio`);
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        await expect(
          table.getByTestId(`${template.id}-template-type`)
        ).toHaveText('Standard letter');

        const previewLink = table.getByTestId(`${template.id}-preview-link`);
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/message-plans/choose-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${template.id}`
        );
      }

      // template filtering checks
      await expect(
        table.getByText(templates.UNSUBMITTED_LETTER.name)
      ).toBeHidden();
      await expect(table.getByText(templates.FRENCH_LETTER.name)).toBeHidden();
      await expect(
        table.getByText(templates.ACCESSIBLE_LETTER.name)
      ).toBeHidden();
      await expect(table.getByText(templates.APP.name)).toBeHidden();

      const submitButton = page.getByTestId('submit-button');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveAttribute('name', 'Save and continue');

      const goBackLink = page.getByRole('link', { name: 'Go back' });
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/message-plans/overview/${messagePlans.LETTER_ROUTING_CONFIG.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}`
      );

      await expect(chooseLetterTemplatePage.errorSummary).toBeVisible();
      await expect(chooseLetterTemplatePage.errorSummaryList).toHaveText([
        'Choose a letter template',
      ]);
    });

    await test.step('pre-selects previously selected template', async () => {
      await page.getByTestId(`${templates.LETTER2.id}-radio`).check();
      await page.getByTestId('submit-button').click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/overview/${messagePlans.LETTER_ROUTING_CONFIG.id}`
      );

      await chooseLetterTemplatePage.loadPage(
        messagePlans.LETTER_ROUTING_CONFIG.id
      );

      // Check summary list is present and displays the name of the previously selected template
      const summaryList = page.getByTestId('previous-selection-summary');
      await expect(summaryList).toBeVisible();
      await expect(summaryList).toContainText('Previously selected template');
      await expect(summaryList).toContainText(templates.LETTER2.name);

      const selectedRadio = page.getByTestId(`${templates.LETTER2.id}-radio`);
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseLetterTemplatePage =
        new ChooseStandardEnglishLetterTemplatePage(page);

      await chooseLetterTemplatePage.loadPage(notFoundMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseLetterTemplatePage =
        new ChooseStandardEnglishLetterTemplatePage(page);

      await chooseLetterTemplatePage.loadPage(invalidMessagePlanId);

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an letter channel', async ({
      page,
      baseURL,
    }) => {
      const chooseLetterTemplatePage =
        new ChooseStandardEnglishLetterTemplatePage(page);

      await chooseLetterTemplatePage.loadPage(
        messagePlans.NON_LETTER_ROUTING_CONFIG.id
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
