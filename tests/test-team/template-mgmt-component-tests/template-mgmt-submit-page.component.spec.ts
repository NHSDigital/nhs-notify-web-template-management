import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { assertGoBackButton } from './template-mgmt-submit-common.steps';
import {
  createAuthHelper,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

  const emailFields = {
    name: 'test-template-name',
    subject: 'test-template-subject-line',
    message: 'test-template-message',
  };

  const smsFields = {
    name: 'test-template-name',
    message: 'test-template-message',
  };

  const nhsAppFields = {
    name: 'test-template-name',
    message: 'test-template-message',
  };

  return {
    email: {
      empty: {
        id: 'submit-page-invalid-email-template',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'EMAIL',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: `CLIENT#${user.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createEmailTemplate(
          '58c51276-19f8-438a-9d7b-bf8bbfed673c',
          user
        ),
        ...emailFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createEmailTemplate(
          '00bc8566-6bd3-45d8-b251-4b205d4e4913',
          user
        ),
        ...emailFields,
      },
      valid: {
        ...TemplateFactory.createEmailTemplate(
          '635ed632-e639-42fa-a328-615cea3bf082',
          user
        ),
        ...emailFields,
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
        owner: `CLIENT#${user.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createSmsTemplate(
          'fd9e4983-460e-475a-af00-4c80615e20b1',
          user
        ),
        ...smsFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createSmsTemplate(
          'a021ca73-674d-44e7-b48d-b7c1e5514fb5',
          user
        ),
        ...smsFields,
      },
      valid: {
        ...TemplateFactory.createSmsTemplate(
          '2a37b26c-4e17-436c-a7b6-97ca1a465e91',
          user
        ),
        ...smsFields,
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
        owner: `CLIENT#${user.clientId}`,
      } as Template,
      submit: {
        ...TemplateFactory.createNhsAppTemplate(
          'f27e0e08-a612-4fe4-95ef-35138c2f28f1',
          user
        ),
        ...nhsAppFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createNhsAppTemplate(
          '395d640b-610a-49bb-9fcd-0f42c521d5fc',
          user
        ),
        ...nhsAppFields,
      },
      valid: {
        ...TemplateFactory.createNhsAppTemplate(
          '1e0dbdd6-d662-42d8-965c-03b8e331458d',
          user
        ),
        ...nhsAppFields,
      },
    },
    letter: {
      empty: {
        id: '324a6461-16af-4b49-939f-dd3562aa037e',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: `CLIENT#${user.clientId}`,
      } as Template,
      submit: TemplateFactory.uploadLetterTemplate(
        '525812d2-04ed-4363-941d-8fc4f41ad2c1',
        user,
        'test-template-name'
      ),
      submitAndReturn: TemplateFactory.uploadLetterTemplate(
        'ca0979e2-a8de-40bc-bf59-8cfd946145c5',
        user,
        'test-template-name'
      ),
      valid: TemplateFactory.uploadLetterTemplate(
        '70ab3978-3d07-4ad4-bf58-a8bbe8db45ec',
        user,
        'test-template-name'
      ),
    },
  };
}

test.describe('Submit template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  test.beforeAll(async () => {
    templates = await createTemplates();
    const templateList = [
      ...Object.values(templates.email),
      ...Object.values(templates['text-message']),
      ...Object.values(templates['nhs-app']),
      ...Object.values(templates.letter),
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
      expectedHeading: "Submit 'test-template-name'",
    },
    {
      channelName: 'SMS',
      channelIdentifier: 'text-message',
      PageModel: TemplateMgmtSubmitSmsPage,
      expectedHeading: "Submit 'test-template-name'",
    },
    {
      channelName: 'NHS App',
      channelIdentifier: 'nhs-app',
      PageModel: TemplateMgmtSubmitNhsAppPage,
      expectedHeading: "Submit 'test-template-name'",
    },
    {
      channelName: 'Letter',
      channelIdentifier: 'letter',
      PageModel: TemplateMgmtSubmitLetterPage,
      expectedHeading: "Approve and submit 'test-template-name'",
    },
  ] as const) {
    // disabling this rule because it doesn't like referencing the templates variable in a loop
    // eslint-disable-next-line no-loop-func
    test(`when user visits ${channelName} page, then page is loaded`, async ({
      page,
      baseURL,
    }) => {
      const submitTemplatePage = new PageModel(page);

      await submitTemplatePage.loadPage(templates[channelIdentifier].valid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-${channelIdentifier}-template/${templates[channelIdentifier].valid.id}`
      );

      await expect(submitTemplatePage.pageHeading).toHaveText(expectedHeading);
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        const props = {
          page: new PageModel(page),
          id: templates[channelIdentifier].valid.id,
          baseURL,
        };

        await assertSkipToMainContent(props);
        await assertHeaderLogoLink(props);
        await assertSignOutLink(props);
        await assertFooterLinks(props);
        await assertGoBackButton({
          ...props,
          expectedUrl: `templates/preview-${channelIdentifier}-template/${templates[channelIdentifier].valid.id}`,
        });
      });

      test(`when user submits form, then the ${channelName} "Template submitted" page is displayed`, async ({
        page,
      }) => {
        const submitTemplatePage = new PageModel(page);

        await submitTemplatePage.loadPage(
          templates[channelIdentifier].submit.id
        );

        await submitTemplatePage.clickSubmitTemplateButton();

        await expect(page).toHaveURL(
          new RegExp(`/templates/${channelIdentifier}-template-submitted/(.*)`) // eslint-disable-line security/detect-non-literal-regexp
        );
      });
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Error handling', () => {
      test(`when user visits ${channelName} page with missing data, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new PageModel(page);

        await submitTemplatePage.loadPage(
          templates[channelIdentifier].empty.id
        );

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });

      test(`when user visits ${channelName} page with a fake template, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new PageModel(page);

        await submitTemplatePage.loadPage('/fake-template-id');

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    });
  }
});
