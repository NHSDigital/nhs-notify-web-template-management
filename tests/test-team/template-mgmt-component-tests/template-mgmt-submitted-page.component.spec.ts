import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { Template } from '../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateMgmtTemplateSubmittedEmailPage } from '../pages/email/template-mgmt-template-submitted-email-page';
import { TemplateMgmtTemplateSubmittedSmsPage } from '../pages/sms/template-mgmt-template-submitted-sms-page';
import { TemplateMgmtTemplateSubmittedNhsAppPage } from '../pages/nhs-app/template-mgmt-template-submitted-nhs-app-page';
import { TemplateMgmtTemplateSubmittedLetterPage } from '../pages/letter/temnplate-mgmt-template-submitted-letter-page';

function createTemplates(owner: string) {
  return {
    email: TemplateFactory.create({
      owner,
      templateType: 'EMAIL',
      templateStatus: 'SUBMITTED',
      id: 'valid-email-template',
      name: 'test-template-email',
      subject: 'test-template-subject',
      message: 'test example content',
    }),
    'text-message': TemplateFactory.create({
      owner,
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      id: 'valid-sms-template',
      name: 'test-template-sms',
      message: 'test example content',
    }),
    'nhs-app': TemplateFactory.create({
      owner,
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      id: 'valid-nhs-app-template',
      name: 'test-template-nhs-app',
      message: 'test example content',
    }),
    letter: {
      ...TemplateFactory.createLetterTemplate(
        'valid-submitted-letter-template',
        owner,
        'test-template-letter',
        'PASSED'
      ),
      templateStatus: 'SUBMITTED',
    },
  };
}

test.describe('Template Submitted Page', () => {
  let templates: Record<string, Template>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
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

      await expect(templateSubmittedPage.pageHeader).toHaveText(
        'Template submitted'
      );

      await expect(templateSubmittedPage.templateNameText).toHaveText(
        `test-template-${channelName}`
      );

      await expect(templateSubmittedPage.templateIdText).toHaveText(
        templates[channelIdentifier].id
      );

      await expect(templateSubmittedPage.serviceNowLink).toHaveAttribute(
        'href',
        'https://nhsdigitallive.service-now.com/nhs_digital?id=sc_cat_item&sys_id=6208dbce1be759102eee65b9bd4bcbf5'
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
        await assertNotifyBannerLink(props);
        await assertFooterLinks(props);
        await assertSignOutLink(props);
        await assertGoBackLink({
          ...props,
          expectedUrl: 'templates/manage-templates',
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
