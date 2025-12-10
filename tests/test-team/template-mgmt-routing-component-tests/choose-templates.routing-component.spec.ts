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
  assertGoBackLinkNotPresent,
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

const validRoutingConfigId = randomUUID();
const invalidRoutingConfigId = 'invalid-id';
const notFoundRoutingConfigId = randomUUID();

const templateIds = {
  NHSAPP: randomUUID(),
  EMAIL: randomUUID(),
  SMS: randomUUID(),
  LETTER: randomUUID(),
};

function createRoutingConfigs(
  user: TestUser
): Record<MessageOrder | 'valid', RoutingConfigDbEntry> {
  const routingConfigs: Record<MessageOrder | 'valid', RoutingConfigDbEntry> =
    {} as Record<MessageOrder | 'valid', RoutingConfigDbEntry>;

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
    { id: validRoutingConfigId, name: 'Test plan with some templates' }
  )
    .addTemplate('NHSAPP', templateIds.NHSAPP)
    .addTemplate('SMS', templateIds.SMS).dbEntry;

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
            if (
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
        validRoutingConfigId
      ),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLinkNotPresent(props);
  });

  test('loads the choose templates page for a message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', validRoutingConfigId);

    await chooseTemplatesPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${validRoutingConfigId}`
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
      `/templates/message-plans/get-ready-to-move/${validRoutingConfigId}`
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
    ).setPathParam('messagePlanId', validRoutingConfigId);

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
        `/templates/message-plans/choose-nhs-app-template/${validRoutingConfigId}?lockNumber=${messagePlans.valid.lockNumber}`
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
        `/templates/message-plans/choose-text-message-template/${validRoutingConfigId}?lockNumber=${messagePlans.valid.lockNumber}`
      );
    });

    await chooseTemplatesPage.nhsApp.clickChangeTemplateLink();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${validRoutingConfigId}?lockNumber=${messagePlans.valid.lockNumber}`
    );

    // TODO: CCM-11537 Choose template then return and assert updated
  });

  test('user can remove templates from their existing message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', validRoutingConfigId);

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

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${validRoutingConfigId}`
    );

    await expect(chooseTemplatesPage.nhsApp.templateName).toBeHidden();
    await expect(chooseTemplatesPage.nhsApp.removeTemplateLink).toBeHidden();
    await expect(chooseTemplatesPage.nhsApp.chooseTemplateLink).toBeVisible();
  });

  test('returns to the message plans list when choosing to "Save and close"', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(
      page
    ).setPathParam('messagePlanId', validRoutingConfigId);

    await chooseTemplatesPage.loadPage();

    await chooseTemplatesPage.saveAndCloseButton.click();

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
      ).setPathParam('messagePlanId', notFoundRoutingConfigId);

      await chooseTemplatesPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseTemplatesPage = new RoutingChooseTemplatesPage(
        page
      ).setPathParam('messagePlanId', invalidRoutingConfigId);

      await chooseTemplatesPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
