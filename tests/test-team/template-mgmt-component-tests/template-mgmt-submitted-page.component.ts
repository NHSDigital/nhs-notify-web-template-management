import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLinkNotPresent,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateFactory } from '../helpers/template-factory';
import { TemplateMgmtTemplateSubmittedPage } from '../pages/template-mgmt-template-submitted-page';
import { TemplateType, TemplateStatus } from '../helpers/types';

const templates = {
  email: TemplateFactory.create({
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.SUBMITTED,
    id: 'valid-email-template',
    name: 'test-template-email',
    subject: 'test-template-subject',
    message: 'test example content',
  }),
  'text-message': TemplateFactory.create({
    templateType: TemplateType.SMS,
    templateStatus: TemplateStatus.SUBMITTED,
    id: 'valid-sms-template',
    name: 'test-template-sms',
    message: 'test example content',
  }),
  'nhs-app': TemplateFactory.create({
    templateType: TemplateType.NHS_APP,
    templateStatus: TemplateStatus.SUBMITTED,
    id: 'valid-nhs-app-template',
    name: 'test-template-nhs-app',
    message: 'test example content',
  }),
};

test.describe('Template Submitted Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  for (const { channelName, channelIdentifier } of [
    { channelName: 'email', channelIdentifier: 'email' },
    { channelName: 'sms', channelIdentifier: 'text-message' },
    { channelName: 'nhs-app', channelIdentifier: 'nhs-app' },
  ] as const) {
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
        await assertLoginLink(props);
        await assertGoBackLinkNotPresent(props);
      });

      test(`when user clicks ${channelName} "Create another template", then user is redirected to "choose-a-template-type"`, async ({
        page,
      }) => {
        const templateSubmittedPage = new TemplateMgmtTemplateSubmittedPage(
          page,
          channelIdentifier
        );

        await templateSubmittedPage.loadPage(templates[channelIdentifier].id);

        await templateSubmittedPage.clickCreateAnotherTemplateLink();

        await expect(page).toHaveURL(
          new RegExp('/templates/choose-a-template-type')
        );
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
