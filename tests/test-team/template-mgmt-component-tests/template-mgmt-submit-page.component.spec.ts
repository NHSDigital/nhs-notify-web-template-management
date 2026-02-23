import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
  assertBackLinkTopNotPresent,
} from '../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { loginAsUser } from 'helpers/auth/login-as-user';

// submit/approve letter tests are in template-mgmt-submit-letter-page.component.spec.ts

test.use({ storageState: { cookies: [], origins: [] } });

let routingDisabledUser: TestUser;
let proofingDisabledAndRoutingEnabledUser: TestUser;

async function createTemplates() {
  return {
    email: {
      empty: {
        id: '8cc45601-6ac7-494c-a462-058e549e6e64',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'EMAIL',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: `CLIENT#${routingDisabledUser.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createEmailTemplate(
          '58c51276-19f8-438a-9d7b-bf8bbfed673c',
          proofingDisabledAndRoutingEnabledUser
        ),
        name: 'submit-email-submit-template',
        subject: 'test-template-subject-line',
        message: 'test-template-message',
      },
      submitAndReturn: {
        ...TemplateFactory.createEmailTemplate(
          '00bc8566-6bd3-45d8-b251-4b205d4e4913',
          routingDisabledUser
        ),
        name: 'submit-and-return-email-template',
        subject: 'test-template-subject-line',
        message: 'test-template-message',
      },
      valid: {
        ...TemplateFactory.createEmailTemplate(
          '635ed632-e639-42fa-a328-615cea3bf082',
          routingDisabledUser
        ),
        name: 'valid-email-submit-template',
        subject: 'test-template-subject-line',
        message: 'test-template-message',
      },
    },
    'text-message': {
      empty: {
        id: 'f5f52951-478d-4d02-a696-a3884a354c3f',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'SMS',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: `CLIENT#${routingDisabledUser.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createSmsTemplate(
          'fd9e4983-460e-475a-af00-4c80615e20b1',
          proofingDisabledAndRoutingEnabledUser
        ),
        name: 'submit-sms-submit-template',
        message: 'test-template-message',
      },
      submitAndReturn: {
        ...TemplateFactory.createSmsTemplate(
          'a021ca73-674d-44e7-b48d-b7c1e5514fb5',
          routingDisabledUser
        ),
        name: 'submit-and-return-sms-template',
        message: 'test-template-message',
      },
      valid: {
        ...TemplateFactory.createSmsTemplate(
          '2a37b26c-4e17-436c-a7b6-97ca1a465e91',
          routingDisabledUser
        ),
        name: 'valid-sms-submit-template',
        message: 'test-template-message',
      },
    },
    'nhs-app': {
      empty: {
        id: '4cb66d37-19b1-4864-9ab6-2a6baf5ba793',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'NHS_APP',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: `CLIENT#${routingDisabledUser.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createNhsAppTemplate(
          'f27e0e08-a612-4fe4-95ef-35138c2f28f1',
          proofingDisabledAndRoutingEnabledUser
        ),
        name: 'submit-nhs-app-submit-template',
        message: 'test-template-message',
      },
      submitAndReturn: {
        ...TemplateFactory.createNhsAppTemplate(
          '395d640b-610a-49bb-9fcd-0f42c521d5fc',
          routingDisabledUser
        ),
        name: 'submit-and-return-nhs-app-template',
        message: 'test-template-message',
      },
      valid: {
        ...TemplateFactory.createNhsAppTemplate(
          '1e0dbdd6-d662-42d8-965c-03b8e331458d',
          routingDisabledUser
        ),
        name: 'valid-nhs-app-submit-template',
        message: 'test-template-message',
      },
    },
  };
}

test.describe('Submit template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    routingDisabledUser = await authHelper.getTestUser(testUsers.User2.userId);
    proofingDisabledAndRoutingEnabledUser = await authHelper.getTestUser(
      testUsers.UserRoutingEnabled.userId
    );

    templates = await createTemplates();
    const templateList = [
      ...Object.values(templates.email),
      ...Object.values(templates['text-message']),
      ...Object.values(templates['nhs-app']),
    ];
    await templateStorageHelper.seedTemplateData(templateList);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  for (const { channelName, channelIdentifier, PageModel, expectedHeading } of [
    {
      channelName: 'Email',
      channelIdentifier: 'email',
      PageModel: TemplateMgmtSubmitEmailPage,
      expectedHeading: "Submit 'valid-email-submit-template'",
    },
    {
      channelName: 'SMS',
      channelIdentifier: 'text-message',
      PageModel: TemplateMgmtSubmitSmsPage,
      expectedHeading: "Submit 'valid-sms-submit-template'",
    },
    {
      channelName: 'NHS App',
      channelIdentifier: 'nhs-app',
      PageModel: TemplateMgmtSubmitNhsAppPage,
      expectedHeading: "Submit 'valid-nhs-app-submit-template'",
    },
  ] as const) {
    // disabling this rule because it doesn't like referencing the templates variable in a loop
    // eslint-disable-next-line no-loop-func
    test(`when user visits ${channelName} page, then page is loaded`, async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(routingDisabledUser, page);

      const template = templates[channelIdentifier].valid;

      const submitTemplatePage = new PageModel(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await submitTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-${channelIdentifier}-template/${template.id}?lockNumber=${template.lockNumber}`
      );

      await expect(submitTemplatePage.pageHeading).toHaveText(expectedHeading);
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        await loginAsUser(routingDisabledUser, page);

        const template = templates[channelIdentifier].valid;
        const props = {
          page: new PageModel(page)
            .setPathParam('templateId', template.id)
            .setSearchParam('lockNumber', String(template.lockNumber)),
          baseURL,
        };

        await assertSkipToMainContent(props);
        await assertHeaderLogoLink(props);
        await assertSignOutLink(props);
        await assertFooterLinks(props);
        await assertBackLinkBottom({
          ...props,
          expectedUrl: `templates/preview-${channelIdentifier}-template/${template.id}`,
        });
        await assertBackLinkTopNotPresent(props);
      });

      test.only(`when user submits form, then the ${channelName} "Submit template" page is displayed`, async ({
        page,
      }) => {
        await loginAsUser(proofingDisabledAndRoutingEnabledUser, page);

        const template = templates[channelIdentifier].submit;
        const submitTemplatePage = new PageModel(page)
          .setPathParam('templateId', template.id)
          .setSearchParam('lockNumber', String(template.lockNumber));

        await submitTemplatePage.loadPage();

        await submitTemplatePage.clickSubmitTemplateButton();

        await expect(page).toHaveURL(
          new RegExp(`/templates/submit-${channelIdentifier}-template/(.*)`) // eslint-disable-line security/detect-non-literal-regexp
        );
      });
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Error handling', () => {
      test(`when user visits ${channelName} page with missing data, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const template = templates[channelIdentifier].empty;
        const submitTemplatePage = new PageModel(page)
          .setPathParam('templateId', template.id)
          .setSearchParam('lockNumber', String(template.lockNumber));

        await submitTemplatePage.loadPage();

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });

      test(`when user visits ${channelName} page with a fake template, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const submitTemplatePage = new PageModel(page)
          .setPathParam('templateId', 'fake-template-id')
          .setSearchParam('lockNumber', '1');

        await submitTemplatePage.loadPage();

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });

      test(`when user visits ${channelName} page without a lock number, redirect to the preview page`, async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const template = templates[channelIdentifier].valid;

        const submitTemplatePage = new PageModel(page).setPathParam(
          'templateId',
          template.id
        );

        await submitTemplatePage.loadPage();

        await expect(page).toHaveURL(
          `${baseURL}/templates/preview-${channelIdentifier}-template/${template.id}`
        );
      });
    });
  }
});
