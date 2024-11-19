import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import { TemplateMgmtSubmitPage } from '../pages/template-mgmt-submit-page';
import { TemplateFactory } from '../helpers/template-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { Template, TemplateType, TemplateStatus } from '../helpers/types';

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

const templates = {
  email: {
    empty: {
      __typename: 'TemplateStorage',
      id: 'submit-page-invalid-email-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    } as Template,
    submit: {
      ...TemplateFactory.createEmailTemplate('submit-email-submit-template'),
      ...emailFields,
    },
    submitAndReturn: {
      ...TemplateFactory.createEmailTemplate(
        'submit-and-return-email-template'
      ),
      ...emailFields,
    },
    valid: {
      ...TemplateFactory.createEmailTemplate('valid-email-submit-template'),
      ...emailFields,
    },
  },
  'text-message': {
    empty: {
      __typename: 'TemplateStorage',
      id: 'submit-page-invalid-sms-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    } as Template,
    submit: {
      ...TemplateFactory.createSmsTemplate('submit-sms-submit-template'),
      ...smsFields,
    },
    submitAndReturn: {
      ...TemplateFactory.createSmsTemplate('submit-and-return-sms-template'),
      ...smsFields,
    },
    valid: {
      ...TemplateFactory.createSmsTemplate('valid-sms-submit-template'),
      ...smsFields,
    },
  },
  'nhs-app': {
    empty: {
      __typename: 'TemplateStorage',
      id: 'submit-page-invalid-nhs-app-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    } as Template,
    submit: {
      ...TemplateFactory.createNhsAppTemplate('submit-nhs-app-submit-template'),
      ...nhsAppFields,
    },
    submitAndReturn: {
      ...TemplateFactory.createNhsAppTemplate(
        'submit-and-return-nhs-app-template'
      ),
      ...nhsAppFields,
    },
    valid: {
      ...TemplateFactory.createNhsAppTemplate('valid-nhs-app-submit-template'),
      ...nhsAppFields,
    },
  },
};

const templatesList = [
  ...Object.values(templates.email),
  ...Object.values(templates['text-message']),
  ...Object.values(templates['nhs-app']),
];

test.describe('Submit template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(templatesList);

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
      const submitTemplatePage = new TemplateMgmtSubmitPage(
        page,
        channelIdentifier
      );

      await submitTemplatePage.loadPage(templates[channelIdentifier].valid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-${channelIdentifier}-template/${templates[channelIdentifier].valid.id}`
      );

      await expect(submitTemplatePage.pageHeader).toHaveText(
        "Submit 'test-template-name'"
      );
    });

    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        const props = {
          page: new TemplateMgmtSubmitPage(page, channelIdentifier),
          id: templates[channelIdentifier].valid.id,
          baseURL,
        };

        await assertSkipToMainContent(props);
        await assertNotifyBannerLink(props);
        await assertLoginLink(props);
        await assertFooterLinks(props);
        await assertGoBackLink({
          ...props,
          expectedUrl: `templates/preview-${channelIdentifier}-template/${templates[channelIdentifier].valid.id}`,
        });
      });

      test(`when user submits form, then the ${channelName} "Template submitted" page is displayed`, async ({
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage(
          templates[channelIdentifier].submit.id
        );

        await submitTemplatePage.clickSubmitTemplateButton();

        await expect(page).toHaveURL(
          new RegExp(`/templates/${channelIdentifier}-template-submitted/(.*)`) // eslint-disable-line security/detect-non-literal-regexp
        );
      });
    });

    test.describe('Error handling', () => {
      test(`when user visits ${channelName} page with missing data, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage(
          templates[channelIdentifier].empty.id
        );

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });

      test(`when user visits ${channelName} page with a fake template, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage('/fake-template-id');

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    });
  }
});
