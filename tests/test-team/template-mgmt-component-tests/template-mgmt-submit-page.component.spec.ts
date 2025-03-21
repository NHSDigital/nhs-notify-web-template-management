import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { assertGoBackButton } from './template-mgmt-submit-common.steps';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtSubmitEmailPage } from '../pages/email/template-mgmt-submit-email-page';
import { TemplateMgmtSubmitNhsAppPage } from '../pages/nhs-app/template-mgmt-submit-nhs-app-page';
import { TemplateMgmtSubmitSmsPage } from '../pages/sms/template-mgmt-submit-sms-page';
import { TemplateMgmtSubmitLetterPage } from '../pages/letter/template-mgmt-submit-letter-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(TestUserId.User1);

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
        owner: user.userId,
      } as Template,
      submit: {
        ...TemplateFactory.createEmailTemplate(
          'submit-email-submit-template',
          user.userId
        ),
        ...emailFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createEmailTemplate(
          'submit-and-return-email-template',
          user.userId
        ),
        ...emailFields,
      },
      valid: {
        ...TemplateFactory.createEmailTemplate(
          'valid-email-submit-template',
          user.userId
        ),
        ...emailFields,
      },
    },
    'text-message': {
      empty: {
        id: 'submit-page-invalid-sms-template',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'SMS',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: user.userId,
      } as Template,
      submit: {
        ...TemplateFactory.createSmsTemplate(
          'submit-sms-submit-template',
          user.userId
        ),
        ...smsFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createSmsTemplate(
          'submit-and-return-sms-template',
          user.userId
        ),
        ...smsFields,
      },
      valid: {
        ...TemplateFactory.createSmsTemplate(
          'valid-sms-submit-template',
          user.userId
        ),
        ...smsFields,
      },
    },
    'nhs-app': {
      empty: {
        id: 'submit-page-invalid-nhs-app-template',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'NHS_APP',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: user.userId,
      } as Template,
      submit: {
        ...TemplateFactory.createNhsAppTemplate(
          'submit-nhs-app-submit-template',
          user.userId
        ),
        ...nhsAppFields,
      },
      submitAndReturn: {
        ...TemplateFactory.createNhsAppTemplate(
          'submit-and-return-nhs-app-template',
          user.userId
        ),
        ...nhsAppFields,
      },
      valid: {
        ...TemplateFactory.createNhsAppTemplate(
          'valid-nhs-app-submit-template',
          user.userId
        ),
        ...nhsAppFields,
      },
    },
    letter: {
      empty: {
        id: 'submit-page-invalid-letter-template',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        owner: user.userId,
      } as Template,
      submit: TemplateFactory.createLetterTemplate(
        'test-template-name',
        user.userId,
        'submit-letter-submit-template',
        'PASSED'
      ),
      submitAndReturn: TemplateFactory.createLetterTemplate(
        'test-template-name',
        user.userId,
        'submit-and-return-letter-template',
        'PASSED'
      ),
      valid: TemplateFactory.createLetterTemplate(
        'test-template-name',
        user.userId,
        'valid-letter-submit-template',
        'PASSED'
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

  for (const { channelName, channelIdentifier, PageModel } of [
    {
      channelName: 'Email',
      channelIdentifier: 'email',
      PageModel: TemplateMgmtSubmitEmailPage,
    },
    {
      channelName: 'SMS',
      channelIdentifier: 'text-message',
      PageModel: TemplateMgmtSubmitSmsPage,
    },
    {
      channelName: 'NHS App',
      channelIdentifier: 'nhs-app',
      PageModel: TemplateMgmtSubmitNhsAppPage,
    },
    {
      channelName: 'Letter',
      channelIdentifier: 'letter',
      PageModel: TemplateMgmtSubmitLetterPage,
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

      await expect(submitTemplatePage.pageHeader).toHaveText(
        "Submit 'test-template-name'"
      );
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
        await assertNotifyBannerLink(props);
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
