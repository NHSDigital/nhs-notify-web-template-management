import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
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
    email: TemplateFactory.create({
      owner: user.userId,
      clientId: user.clientId,
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      id: 'valid-email-template',
      name: 'test-template-email',
      subject: 'test-template-subject',
      message: 'test example content',
    }),
    'text-message': TemplateFactory.create({
      owner: user.userId,
      clientId: user.clientId,
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      id: 'valid-text-message-template',
      name: 'test-template-sms',
      message: 'test example content',
    }),
    'nhs-app': TemplateFactory.create({
      owner: user.userId,
      clientId: user.clientId,
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      id: 'valid-nhs-app-template',
      name: 'test-template-nhs-app',
      message: 'test example content',
    }),
    letter: TemplateFactory.uploadLetterTemplate(
      'valid-submitted-letter-template',
      user,
      'test-template-letter',
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
      const templateSubmittedPage = new PageModel(page);

      await templateSubmittedPage.loadPage(templates[channelIdentifier].id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/${channelIdentifier}-template-submitted/${templates[channelIdentifier].id}`
      );

      await expect(templateSubmittedPage.pageHeading).toHaveText(
        'Template submitted'
      );

      await expect(templateSubmittedPage.templateNameText).toHaveText(
        `test-template-${channelName}`
      );

      await expect(templateSubmittedPage.templateIdText).toHaveText(
        templates[channelIdentifier].id
      );
    });

    // eslint-disable-next-line no-loop-func
    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        const props = {
          page: new PageModel(page),
          id: templates[channelIdentifier].id,
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
        const templateSubmittedPage = new PageModel(page);

        await templateSubmittedPage.loadPage('/fake-template-id');

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    });
  }
});
