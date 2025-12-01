import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtTemplateSubmittedEmailPage } from '../pages/email/template-mgmt-template-submitted-email-page';
import { TemplateMgmtTemplateSubmittedSmsPage } from '../pages/sms/template-mgmt-template-submitted-sms-page';
import { TemplateMgmtTemplateSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-template-submitted-nhs-app-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/template-mgmt-template-submitted-letter-page';

function createTemplates(user: TestUser) {
  return {
    email: {
      ...TemplateFactory.createEmailTemplate(
        'a0a8c3d3-84e1-4fd8-9e9c-53ef4830f03f',
        user,
        'submitted-page-email-template'
      ),
      templateStatus: 'SUBMITTED',
      subject: 'test-template-subject',
      message: 'test example content',
    },
    'text-message': {
      ...TemplateFactory.createSmsTemplate(
        'a17074b5-8936-48b2-b3d6-d5aec045c538',
        user,
        'submitted-page-sms-template'
      ),
      templateStatus: 'SUBMITTED',
      message: 'test example content',
    },
    'nhs-app': {
      ...TemplateFactory.createNhsAppTemplate(
        'bc924b01-d395-4037-906a-7aae3c660bf4',
        user,
        'submitted-page-nhs-app-template'
      ),
      templateStatus: 'SUBMITTED',
      message: 'test example content',
    },
    letter: TemplateFactory.uploadLetterTemplate(
      'dec6b9b4-b257-4fdc-b6b4-5eda672b2eac',
      user,
      'submitted-page-letter-template',
      'SUBMITTED',
      'PASSED'
    ),
  };
}

test.describe('Template Submitted Page', () => {
  let templates: Record<string, Template>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  for (const { channelName, channelIdentifier, PageModel } of [
    {
      channelName: 'email',
      channelIdentifier: 'email',
      PageModel: TemplateMgmtTemplateSubmittedEmailPage,
    },
    {
      channelName: 'sms',
      channelIdentifier: 'text-message',
      PageModel: TemplateMgmtTemplateSubmittedSmsPage,
    },
    {
      channelName: 'nhs-app',
      channelIdentifier: 'nhs-app',
      PageModel: TemplateMgmtTemplateSubmittedNhsAppPage,
    },
    {
      channelName: 'letter',
      channelIdentifier: 'letter',
      PageModel: TemplateMgmtTemplateSubmittedLetterPage,
    },
  ] as const) {
    // eslint-disable-next-line no-loop-func
    test(`when user visits ${channelName} page, then page is loaded`, async ({
      page,
      baseURL,
    }) => {
      const templateSubmittedPage = new PageModel(page).setPathParam(
        'templateId',
        templates[channelIdentifier].id
      );

      await templateSubmittedPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/${channelIdentifier}-template-submitted/${templates[channelIdentifier].id}`
      );

      await expect(templateSubmittedPage.pageHeading).toHaveText(
        'Template submitted'
      );

      await expect(templateSubmittedPage.templateNameText).toHaveText(
        templates[channelIdentifier].name
      );

      await expect(templateSubmittedPage.templateIdText).toHaveText(
        templates[channelIdentifier].id
      );
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        const props = {
          page: new PageModel(page).setPathParam(
            'templateId',
            templates[channelIdentifier].id
          ),
          baseURL,
        };

        await assertSkipToMainContent(props);
        await assertHeaderLogoLink(props);
        await assertFooterLinks(props);
        await assertSignOutLink(props);
        await assertGoBackLink({
          ...props,
          expectedUrl: 'templates/message-templates',
        });
      });
    });

    test.describe('Error handling', () => {
      test(`when user visits ${channelName} page with invalid data, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const templateSubmittedPage = new PageModel(page).setPathParam(
          'templateId',
          'fake-template-id'
        );

        await templateSubmittedPage.loadPage();

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    });
  }
});
