import { test, expect } from '@playwright/test';
import { TemplateMgmtRequestADigitalProofPage } from '../pages/template-mgmt-request-a-digital-proof-page';
import {
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from '../helpers/template-mgmt-common.steps';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { createAuthHelper, testUsers } from 'helpers/auth/cognito-auth-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';

const templateIds = {
  SMS: randomUUID(),
  NHS_APP: randomUUID(),
  EMAIL: randomUUID(),
  LETTER: randomUUID(),
};

test.describe('How to request a digital proof', () => {
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    await templateStorageHelper.seedTemplateData([
      TemplateFactory.createSmsTemplate(templateIds.SMS, user),
      TemplateFactory.createEmailTemplate(templateIds.EMAIL, user),
      TemplateFactory.createNhsAppTemplate(templateIds.NHS_APP, user),
      TemplateFactory.createAuthoringLetterTemplate(
        templateIds.LETTER,
        user,
        `Test letter template - ${templateIds.LETTER}`
      ),
    ]);
  });

  for (const { channelName, channelIdentifier, templateId } of [
    {
      channelName: 'Email',
      channelIdentifier: 'email',
      templateId: templateIds.EMAIL,
    },
    {
      channelName: 'SMS',
      channelIdentifier: 'text-message',
      templateId: templateIds.SMS,
    },
    {
      channelName: 'NHS App',
      channelIdentifier: 'nhs-app',
      templateId: templateIds.NHS_APP,
    },
  ] as const) {
    test(`should load page ${channelName}`, async ({ page, baseURL }) => {
      const requestADigitalProofPage = new TemplateMgmtRequestADigitalProofPage(
        page
      ).setPathParam('templateId', templateId);

      await requestADigitalProofPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/request-a-proof/${templateId}`
      );

      await expect(requestADigitalProofPage.pageHeading).toHaveText(
        'Request a proof'
      );

      const backLink = page.getByRole('link', {
        name: 'Back to template',
      });

      await expect(backLink).toHaveAttribute(
        'href',
        `/templates/preview-${channelIdentifier}-template/${templateId}`
      );
    });
  }

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtRequestADigitalProofPage(page).setPathParam(
        'templateId',
        templateIds.SMS
      ),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
  });

  test('should not load page when template is a letter', async ({
    baseURL,
    page,
  }) => {
    const requestADigitalProofPage = new TemplateMgmtRequestADigitalProofPage(
      page
    ).setPathParam('templateId', templateIds.LETTER);

    await requestADigitalProofPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
  });
});
