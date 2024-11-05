import { test, expect } from '@playwright/test';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TemplateMgmtSubmitPage } from '../pages/template-mgmt-submit-page';
import { SessionFactory } from '../helpers/session-factory';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';

const templateIds = new Set<string>();

const getAndStoreTemplateId = (url: string) => {
  const id = String(url.split('/').pop());
  templateIds.add(id);
  return id;
};

const emailFields = {
  emailTemplateName: 'test-template-name',
  emailTemplateSubjectLine: 'test-template-subject-line',
  emailTemplateMessage: 'test-template-message',
};

const smsFields = {
  smsTemplateName: 'test-template-name',
  smsTemplateMessage: 'test-template-message',
};

const nhsAppFields = {
  nhsAppTemplateName: 'test-template-name',
  nhsAppTemplateMessage: 'test-template-message',
};

const sessions = {
  email: {
    empty: SessionFactory.createEmailSession('empty-email-submit-session'),
    submit: {
      ...SessionFactory.createEmailSession('submit-email-submit-session'),
      ...emailFields,
    },
    submitAndReturn: {
      ...SessionFactory.createEmailSession('submit-and-return-email-session'),
      ...emailFields,
    },
    valid: {
      ...SessionFactory.createEmailSession('valid-email-submit-session'),
      ...emailFields,
    },
  },
  'text-message': {
    empty: SessionFactory.createSmsSession('empty-sms-submit-session'),
    submit: {
      ...SessionFactory.createSmsSession('submit-sms-submit-session'),
      ...smsFields,
    },
    submitAndReturn: {
      ...SessionFactory.createSmsSession('submit-and-return-sms-session'),
      ...smsFields,
    },
    valid: {
      ...SessionFactory.createSmsSession('valid-sms-submit-session'),
      ...smsFields,
    },
  },
  'nhs-app': {
    empty: SessionFactory.createNhsAppSession('empty-nhs-app-submit-session'),
    submit: {
      ...SessionFactory.createNhsAppSession('submit-nhs-app-submit-session'),
      ...nhsAppFields,
    },
    submitAndReturn: {
      ...SessionFactory.createNhsAppSession(
        'submit-and-return-nhs-app-session'
      ),
      ...nhsAppFields,
    },
    valid: {
      ...SessionFactory.createNhsAppSession('valid-nhs-app-submit-session'),
      ...nhsAppFields,
    },
  },
};

const sessionsList = [
  ...Object.values(sessions.email),
  ...Object.values(sessions['text-message']),
  ...Object.values(sessions['nhs-app']),
];

test.describe('Submit template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper(sessionsList);

  const templateStorageHelper = new TemplateStorageHelper([]);

  test.beforeAll(async () => {
    await sessionStorageHelper.seedSessionData();
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
    await templateStorageHelper.deleteTemplates([...templateIds.values()]);
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

      await submitTemplatePage.loadPage(sessions[channelIdentifier].valid.id);

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-${channelIdentifier}-template/${sessions[channelIdentifier].valid.id}`
      );

      await expect(submitTemplatePage.pageHeader).toHaveText(
        "Submit 'test-template-name'"
      );
    });

    test.describe('Page functionality', () => {
      test(`common ${channelName} page tests`, async ({ page, baseURL }) => {
        const props = {
          page: new TemplateMgmtSubmitPage(page, channelIdentifier),
          id: sessions[channelIdentifier].valid.id,
          baseURL,
        };

        await assertSkipToMainContent(props);
        await assertNotifyBannerLink(props);
        await assertLoginLink(props);
        await assertFooterLinks(props);
        await assertGoBackLink({
          ...props,
          expectedUrl: `templates/preview-${channelIdentifier}-template/${sessions[channelIdentifier].valid.id}`,
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
          sessions[channelIdentifier].submit.id
        );

        await submitTemplatePage.clickSubmitTemplateButton();

        await expect(page).toHaveURL(
          new RegExp(`/templates/${channelIdentifier}-template-submitted/(.*)`) // eslint-disable-line security/detect-non-literal-regexp
        );

        const templateId = getAndStoreTemplateId(page.url());

        const template = await templateStorageHelper.getTemplate(templateId!);

        expect(template).toBeTruthy();
      });
    });

    test.describe('Error handling', () => {
      test(`when user visits ${channelName} page with missing data, then an invalid session error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage(sessions[channelIdentifier].empty.id);

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
      });

      test(`when user visits ${channelName} page with a fake session, then an invalid session error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage('/fake-session-id');

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-session`);
      });

      test(`when user submits ${channelName} form and returns, then an invalid session error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const submitTemplatePage = new TemplateMgmtSubmitPage(
          page,
          channelIdentifier
        );

        await submitTemplatePage.loadPage(
          sessions[channelIdentifier].submitAndReturn.id
        );

        await submitTemplatePage.clickSubmitTemplateButton();

        getAndStoreTemplateId(page.url());

        await expect
          .poll(
            async () => {
              await submitTemplatePage.loadPage(
                sessions[channelIdentifier].submitAndReturn.id
              );
              return page.url();
            },
            {
              intervals: [1000, 2000, 3000],
            }
          )
          .toBe(`${baseURL}/templates/invalid-session`);
      });
    });
  }
});
