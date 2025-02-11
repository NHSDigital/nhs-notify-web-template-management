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
import { TemplateMgmtTemplateSubmittedPage } from '../pages/template-mgmt-template-submitted-base-page';
import { TemplateType, TemplateStatus, Template } from '../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    email: TemplateFactory.create({
      owner,
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.SUBMITTED,
      id: 'valid-email-template',
      name: 'test-template-email',
      subject: 'test-template-subject',
      message: 'test example content',
    }),
    'text-message': TemplateFactory.create({
      owner,
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.SUBMITTED,
      id: 'valid-sms-template',
      name: 'test-template-sms',
      message: 'test example content',
    }),
    'nhs-app': TemplateFactory.create({
      owner,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.SUBMITTED,
      id: 'valid-nhs-app-template',
      name: 'test-template-nhs-app',
      message: 'test example content',
    }),
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

  for (const { channelName, channelIdentifier } of [
    { channelName: 'email', channelIdentifier: 'email' },
    { channelName: 'sms', channelIdentifier: 'text-message' },
    { channelName: 'nhs-app', channelIdentifier: 'nhs-app' },
  ] as const) {
    // eslint-disable-next-line no-loop-func
    test(`when user visits ${channelName} page, then page is loaded`, async ({
      page,
      baseURL,
    }) => {
      const templateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
        page,
        channelIdentifier
      );

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
          page: new TemplateMgmtTemplateSubmittedPage(page, channelIdentifier),
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
        const templateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
          page,
          channelIdentifier
        );

        await templateSubmittedPage.loadPage('/fake-template-id');

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    });
  }
});
