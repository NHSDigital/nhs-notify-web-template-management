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
import { TemplateType } from '../helpers/types';

const templates = {
  email: TemplateFactory.create({
    type: TemplateType.EMAIL,
    id: 'valid-email-template',
    name: 'test-template-email',
    fields: {
      content: 'test example content',
    },
  }),
  'text-message': TemplateFactory.create({
    type: TemplateType.SMS,
    id: 'valid-sms-template',
    name: 'test-template-sms',
    fields: {
      content: 'test example content',
    },
  }),
  'nhs-app': TemplateFactory.create({
    type: TemplateType.NHS_APP,
    id: 'valid-nhs-app-template',
    name: 'test-template-nhs-app',
    fields: {
      content: 'test example content',
    },
  }),
};

test.describe('Submit Email message template Page', () => {
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
    { channelName: 'Email', channelIdentifier: 'email' },
    { channelName: 'SMS', channelIdentifier: 'text-message' },
    { channelName: 'NHS App', channelIdentifier: 'nhs-app' },
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
        templates[channelIdentifier].name
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

      test(`when user submits clicks ${channelName} "Create another template", then user is redirected to "create-template"`, async ({
        page,
      }) => {
        const emailTemplateSubmittedPage =
          new TemplateMgmtTemplateSubmittedPage(page, 'email');

        await emailTemplateSubmittedPage.loadPage(
          templates[channelIdentifier].id
        );

        await emailTemplateSubmittedPage.clickCreateAnotherTemplateLink();

        await expect(page).toHaveURL(
          new RegExp('/templates/choose-a-template-type/(.*)')
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
