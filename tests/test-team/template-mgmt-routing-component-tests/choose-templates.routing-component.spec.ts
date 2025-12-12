/* eslint-disable jest/no-commented-out-tests */
import {
  MESSAGE_ORDERS,
  MessageOrder,
  ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS,
} from '../helpers/enum';
import { test, expect } from '@playwright/test';
import { RoutingChooseTemplatesPage } from 'pages/routing/choose-templates-page';
import { RoutingCreateMessagePlanPage } from 'pages/routing/create-message-plan-page';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertNoBackLinks,
} from '../helpers/template-mgmt-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import {
  RoutingConfigDbEntry,
  expectedChannelLabels,
  allChannels,
  ordinals,
} from 'helpers/types';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const templateIds = {
  NHSAPP: randomUUID(),
  EMAIL: randomUUID(),
  SMS: randomUUID(),
  LETTER: randomUUID(),
  LARGE_PRINT_LETTER: randomUUID(),
  FRENCH_LETTER: randomUUID(),
  SPANISH_LETTER: randomUUID(),
};

const routingConfigIds = {
  valid: randomUUID(),
  validWithLetterTemplates: randomUUID(),
  invalid: 'invalid-id',
  notFound: randomUUID(),
};

function createRoutingConfigs(
  user: TestUser
): Record<MessageOrder | keyof typeof routingConfigIds, RoutingConfigDbEntry> {
  const routingConfigs: Record<
    MessageOrder | keyof typeof routingConfigIds,
    RoutingConfigDbEntry
  > = {} as Record<
    MessageOrder | keyof typeof routingConfigIds,
    RoutingConfigDbEntry
  >;

  for (const messageOrder of MESSAGE_ORDERS) {
    const routingConfig = RoutingConfigFactory.createForMessageOrder(
      user,
      messageOrder
    ).dbEntry;
    routingConfigs[messageOrder] = routingConfig;
  }

  routingConfigs.valid = RoutingConfigFactory.createForMessageOrder(
    user,
    'NHSAPP,EMAIL,SMS,LETTER',
    { id: routingConfigIds.valid, name: 'Test plan with some templates' }
  )
    .addTemplate('NHSAPP', templateIds.NHSAPP)
    .addTemplate('SMS', templateIds.SMS).dbEntry;

  routingConfigs.validWithLetterTemplates =
    RoutingConfigFactory.createForMessageOrder(user, 'LETTER', {
      id: routingConfigIds.validWithLetterTemplates,
      name: 'Letter plan',
    })
      .addTemplate('LETTER', templateIds.LETTER)
      .addLanguageTemplate('fr', templateIds.FRENCH_LETTER)
      .addLanguageTemplate('es', templateIds.SPANISH_LETTER)
      .addAccessibleFormatTemplate(
        'x1',
        templateIds.LARGE_PRINT_LETTER
      ).dbEntry;

  return routingConfigs;
}

function createTemplates(user: TestUser) {
  return {
    NHSAPP: TemplateFactory.createNhsAppTemplate(
      templateIds.NHSAPP,
      user,
      'Test NHS App template'
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      'Test Email template'
    ),
    SMS: TemplateFactory.createSmsTemplate(
      templateIds.SMS,
      user,
      'Test SMS template'
    ),
    LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LETTER,
      user,
      'Test Letter template'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      'Test Large Print Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      'Test French Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    SPANISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.SPANISH_LETTER,
      user,
      'Test Spanish Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'es' }
    ),
  };
}

test.describe('Routing - Choose Templates page', () => {
  let messagePlans: ReturnType<typeof createRoutingConfigs>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    messagePlans = await createRoutingConfigs(user);
    templates = createTemplates(user);

    await routingConfigStorageHelper.seed(Object.values(messagePlans));
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test.describe('shows the correct channels based on the message order selected', () => {
    for (const {
      label,
      messageOrder,
    } of ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS) {
      test(`shows correct channels for message order: ${label}`, async ({
        page,
      }) => {
        const createMessagePlanPage = new RoutingCreateMessagePlanPage(
          page
        ).setSearchParam('messageOrder', messageOrder);

        await createMessagePlanPage.loadPage();

        await createMessagePlanPage.nameField.fill(`Plan for ${label}`);
        await createMessagePlanPage.clickSubmit();

        const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

        await expect(page).toHaveURL(
          /\/templates\/message-plans\/choose-templates\//
        );

        const { messagePlanId } =
          chooseTemplatesPage.getPathParametersFromCurrentPageUrl();

        expect(messagePlanId).not.toBeUndefined();

        chooseTemplatesPage.setPathParam('messagePlanId', messagePlanId!);

        const messagePlanChannels = messageOrder.split(',');

        for (const channel of allChannels) {
          const channelBlock =
            chooseTemplatesPage.messagePlanChannel(channel).block;
          const fallbackConditions =
            chooseTemplatesPage.messagePlanChannel(channel).fallbackConditions;

          if (messagePlanChannels.includes(channel)) {
            const channelIndexInPlan = messagePlanChannels.indexOf(channel);

            await test.step('channel that is included in the plan appears with its number', async () => {
              await expect(channelBlock).toBeVisible();
              await expect(channelBlock).toContainText(
                expectedChannelLabels[channel]
              );
              await expect(
                chooseTemplatesPage.messagePlanChannel(channel).number
              ).toHaveText((channelIndexInPlan + 1).toString());
            });

            // eslint-disable-next-line unicorn/prefer-ternary
            if (channel === 'LETTER') {
              await test.step('letter channel displays section for fallback conditions and additional letter formats', async () => {
                const alternativeLetterFormats =
                  chooseTemplatesPage.alternativeLetterFormats();
                await expect(
                  alternativeLetterFormats.conditionalTemplates
                ).toBeVisible();
                await expect(
                  alternativeLetterFormats.fallbackConditions
                ).toBeVisible();
              });
            } else if (
              messagePlanChannels.length > 1 &&
              channelIndexInPlan < messagePlanChannels.length - 1
            ) {
              await test.step('channel displays fallback conditions where its followed by a subsequent channel', async () => {
                await expect(fallbackConditions).toBeVisible();

                const listItems = await fallbackConditions
                  .locator('li')
                  .allTextContents();
                expect(listItems[0]).toContain(ordinals[channelIndexInPlan]);
                expect(listItems[1]).toContain(
                  ordinals[channelIndexInPlan + 1]
                );
              });
            } else {
              await test.step('channel that is last (or the only one) in the plan does not have fallback conditions', async () => {
                await expect(fallbackConditions).toBeHidden();
              });
            }
          } else {
            await test.step('channel not in the plan does not appear', async () => {
              await expect(channelBlock).toBeHidden();
              await expect(fallbackConditions).toBeHidden();
            });
          }
        }
      });
    }
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseTemplatesPage(page).setPathParam(
        'messagePlanId',
        routingConfigIds.valid
      ),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertNoBackLinks(props);
  });

  test('loads the choose templates page for a message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.valid);

    await chooseTemplatesPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigIds.valid}`
    );
    await expect(chooseTemplatesPage.pageHeading).toHaveText(
      messagePlans.valid.name
    );

    await expect(chooseTemplatesPage.changeNameLink).toHaveText('Change name');
    await expect(chooseTemplatesPage.changeNameLink).toHaveAttribute(
      'href',
      `/templates/message-plans/edit-message-plan-settings/${messagePlans.valid.id}`
    );

    await expect(chooseTemplatesPage.routingConfigId).toHaveText(
      messagePlans.valid.id
    );

    const messagePlanStatus =
      await chooseTemplatesPage.messagePlanStatus.textContent();
    expect(messagePlanStatus?.trim().toLowerCase()).toBe(
      messagePlans.valid.status.toLowerCase()
    );

    const channelBlocks = await chooseTemplatesPage.channelBlocks.all();
    expect(channelBlocks.length).toBe(messagePlans.valid.cascade.length);

    await expect(chooseTemplatesPage.moveToProductionButton).toHaveText(
      'Move to production'
    );
    await expect(chooseTemplatesPage.moveToProductionButton).toHaveAttribute(
      'href',
      `/templates/message-plans/get-ready-to-move/${routingConfigIds.valid}`
    );
    await expect(chooseTemplatesPage.saveAndCloseButton).toHaveText(
      'Save and close'
    );
    await expect(chooseTemplatesPage.saveAndCloseButton).toHaveAttribute(
      'href',
      '/templates/message-plans'
    );
  });

  test('user can choose templates to add to their new message plan', async ({
    page,
    baseURL,
  }) => {
    const messageOrder: MessageOrder = 'NHSAPP,SMS';

    const createMessagePlanPage = new RoutingCreateMessagePlanPage(
      page
    ).setSearchParam('messageOrder', messageOrder);

    await createMessagePlanPage.loadPage();
    await createMessagePlanPage.nameField.fill('Test message plan');
    await createMessagePlanPage.clickSubmit();

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

    await expect(page).toHaveURL(
      /\/templates\/message-plans\/choose-templates\//
    );

    const { messagePlanId } =
      chooseTemplatesPage.getPathParametersFromCurrentPageUrl();

    expect(messagePlanId).not.toBeUndefined();

    await test.step('app channel with no template has only choose link', async () => {
      await expect(chooseTemplatesPage.nhsApp.templateName).toBeHidden();
      await expect(chooseTemplatesPage.nhsApp.chooseTemplateLink).toBeVisible();
      await expect(
        chooseTemplatesPage.nhsApp.chooseTemplateLink
      ).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-nhs-app-template/${messagePlanId}?lockNumber=0`
      );
      await expect(chooseTemplatesPage.nhsApp.changeTemplateLink).toBeHidden();
      await expect(chooseTemplatesPage.nhsApp.removeTemplateLink).toBeHidden();
    });

    await test.step('sms channel with no template has only choose link', async () => {
      await expect(chooseTemplatesPage.sms.templateName).toBeHidden();
      await expect(chooseTemplatesPage.sms.chooseTemplateLink).toBeVisible();
      await expect(chooseTemplatesPage.sms.chooseTemplateLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-text-message-template/${messagePlanId}?lockNumber=0`
      );
      await expect(chooseTemplatesPage.sms.changeTemplateLink).toBeHidden();
      await expect(chooseTemplatesPage.sms.removeTemplateLink).toBeHidden();
    });

    await chooseTemplatesPage.nhsApp.clickChooseTemplateLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${messagePlanId}?lockNumber=0`
    );

    // TODO: CCM-11537 Choose template then return and assert updated
  });

  test('user can change templates on their existing message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.valid);

    await chooseTemplatesPage.loadPage();

    await test.step('app channel with template has template name and change link', async () => {
      await expect(chooseTemplatesPage.nhsApp.templateName).toHaveText(
        templates.NHSAPP.name
      );
      await expect(chooseTemplatesPage.nhsApp.changeTemplateLink).toBeVisible();
      await expect(
        chooseTemplatesPage.nhsApp.changeTemplateLink
      ).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-nhs-app-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
      );
    });

    await test.step('email channel with no template has no name or change link', async () => {
      await expect(chooseTemplatesPage.email.templateName).toBeHidden();
      await expect(chooseTemplatesPage.email.changeTemplateLink).toBeHidden();
    });

    await test.step('sms channel with template has template name and change link', async () => {
      await expect(chooseTemplatesPage.sms.templateName).toHaveText(
        templates.SMS.name
      );
      await expect(chooseTemplatesPage.sms.changeTemplateLink).toBeVisible();
      await expect(chooseTemplatesPage.sms.changeTemplateLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-text-message-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
      );
    });

    await test.step('letter channel with no template selected has no name or change link', async () => {
      await expect(chooseTemplatesPage.letter.templateName).toBeHidden();
      await expect(chooseTemplatesPage.letter.changeTemplateLink).toBeHidden();
    });

    await chooseTemplatesPage.nhsApp.clickChangeTemplateLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
    );

    // TODO: CCM-11537 Choose template then return and assert updated
  });

  test('user can remove templates from their existing message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.valid);

    await chooseTemplatesPage.loadPage();

    await expect(chooseTemplatesPage.nhsApp.templateName).toHaveText(
      templates.NHSAPP.name
    );
    await expect(chooseTemplatesPage.nhsApp.removeTemplateLink).toBeVisible();

    await expect(chooseTemplatesPage.email.removeTemplateLink).toBeHidden();

    await expect(chooseTemplatesPage.sms.templateName).toHaveText(
      templates.SMS.name
    );
    await expect(chooseTemplatesPage.sms.removeTemplateLink).toBeVisible();

    await chooseTemplatesPage.nhsApp.clickRemoveTemplateLink();

    await expect(chooseTemplatesPage.letter.removeTemplateLink).toBeHidden();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigIds.valid}`
    );

    await expect(chooseTemplatesPage.nhsApp.templateName).toBeHidden();
    await expect(chooseTemplatesPage.nhsApp.removeTemplateLink).toBeHidden();
    await expect(chooseTemplatesPage.nhsApp.chooseTemplateLink).toBeVisible();
  });

  test('user can choose alternative letter format options', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.valid);

    await chooseTemplatesPage.loadPage();

    const alternativeLetterFormats =
      chooseTemplatesPage.alternativeLetterFormats();

    await expect(alternativeLetterFormats.conditionalTemplates).toBeVisible();
    await expect(alternativeLetterFormats.fallbackConditions).toBeVisible();

    const listItems = await alternativeLetterFormats.listItems;
    expect(await listItems.count()).toBe(2);

    const largePrintItem = alternativeLetterFormats.largePrint;
    const otherLanguagesItem = alternativeLetterFormats.otherLanguages;

    await expect(largePrintItem.heading).toHaveText(
      'Large print letter (optional)'
    );
    await expect(largePrintItem.templateName).toBeHidden();
    await expect(largePrintItem.chooseTemplateLink).toBeVisible();
    await expect(largePrintItem.chooseTemplateLink).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-large-print-letter-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
    );
    await expect(largePrintItem.changeTemplateLink).toBeHidden();
    await expect(largePrintItem.removeTemplateLink).toBeHidden();

    await expect(otherLanguagesItem.heading).toHaveText(
      'Other language letters (optional)'
    );
    await expect(otherLanguagesItem.templateName).toBeHidden();
    await expect(otherLanguagesItem.chooseTemplateLink).toBeVisible();
    await expect(otherLanguagesItem.chooseTemplateLink).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-other-language-letter-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
    );
    await expect(otherLanguagesItem.changeTemplateLink).toBeHidden();
    await expect(otherLanguagesItem.removeTemplateLink).toBeHidden();

    await largePrintItem.clickChooseTemplateLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${routingConfigIds.valid}?lockNumber=${messagePlans.valid.lockNumber}`
    );
  });

  test('user can manage the various letter templates selected on their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.validWithLetterTemplates);

    await chooseTemplatesPage.loadPage();

    await test.step('standard letter channel with default template has template name and change link', async () => {
      await expect(chooseTemplatesPage.letter.templateName).toHaveText(
        templates.LETTER.name
      );
      await expect(chooseTemplatesPage.letter.changeTemplateLink).toBeVisible();
      await expect(
        chooseTemplatesPage.letter.changeTemplateLink
      ).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-standard-english-letter-template/${routingConfigIds.validWithLetterTemplates}?lockNumber=${messagePlans.validWithLetterTemplates.lockNumber}`
      );
      await expect(chooseTemplatesPage.letter.removeTemplateLink).toBeVisible();
      await expect(chooseTemplatesPage.letter.chooseTemplateLink).toBeHidden();
    });

    const alternativeLetterFormats =
      chooseTemplatesPage.alternativeLetterFormats();

    await test.step('standard letter is followed by alternative formats', async () => {
      await expect(alternativeLetterFormats.conditionalTemplates).toBeVisible();
      await expect(alternativeLetterFormats.fallbackConditions).toBeVisible();

      const listItems = await alternativeLetterFormats.listItems;
      expect(await listItems.count()).toBe(2);
    });

    const largePrintItem = alternativeLetterFormats.largePrint;
    const otherLanguagesItem = alternativeLetterFormats.otherLanguages;

    await test.step('accessible formats - large print template has name and change link', async () => {
      await expect(largePrintItem.templateName).toHaveText(
        templates.LARGE_PRINT_LETTER.name
      );
      await expect(largePrintItem.changeTemplateLink).toBeVisible();
      await expect(largePrintItem.changeTemplateLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-large-print-letter-template/${routingConfigIds.validWithLetterTemplates}`
      );
      await expect(largePrintItem.removeTemplateLink).toBeVisible();
      await expect(largePrintItem.chooseTemplateLink).toBeHidden();
    });

    await test.step('foreign language templates are displayed with names and change link', async () => {
      const templateNames = await otherLanguagesItem.templateNames.all();
      expect(templateNames.length).toBe(2);

      await expect(templateNames[0]).toHaveText(templates.FRENCH_LETTER.name);
      await expect(templateNames[1]).toHaveText(templates.SPANISH_LETTER.name);

      await expect(otherLanguagesItem.changeTemplateLink).toBeVisible();
      await expect(otherLanguagesItem.changeTemplateLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-other-language-letter-template/${routingConfigIds.validWithLetterTemplates}?lockNumber=${messagePlans.validWithLetterTemplates.lockNumber}`
      );
      await expect(otherLanguagesItem.removeTemplateLink).toBeVisible();
      await expect(otherLanguagesItem.chooseTemplateLink).toBeHidden();
    });

    await test.step('can remove all foreign language templates', async () => {
      await otherLanguagesItem.clickRemoveTemplateLink();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${routingConfigIds.validWithLetterTemplates}`
      );

      await expect(otherLanguagesItem.templateName).toBeHidden();
      await expect(otherLanguagesItem.removeTemplateLink).toBeHidden();
      await expect(otherLanguagesItem.chooseTemplateLink).toBeVisible();
    });

    await test.step('can change large print template', async () => {
      await largePrintItem.clickChangeTemplateLink();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-large-print-letter-template/${routingConfigIds.validWithLetterTemplates}`
      );
    });
  });

  test('returns to the message plans list when choosing to "Save and close"', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', routingConfigIds.valid);

    await chooseTemplatesPage.loadPage();

    await chooseTemplatesPage.clickSaveAndClose();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);
  });

  //  TODO: CCM-11495
  //  Upgrade to the below once validation is in
  //  test('can move to production once all templates have been chosen', () => {});

  // TODO: CCM-11495
  // Add as part of validation ticket
  // test('displays an error message when trying to "Move to production" without all required templates', () => {});

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseTemplatesPage = new RoutingChooseTemplatesPage(
        page
      ).setPathParam('messagePlanId', routingConfigIds.notFound);

      await chooseTemplatesPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseTemplatesPage = new RoutingChooseTemplatesPage(
        page
      ).setPathParam('messagePlanId', routingConfigIds.invalid);

      await chooseTemplatesPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
