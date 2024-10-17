import { test, expect } from '@playwright/test';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TestUserClient } from '../helpers/test-user-client';

export const smsTemplateSessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-2222-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.SMS,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const testUserEmail = 'create-sms-page@nhs.net';
const testUserPassword = 'Test-Password1';

test.describe('Create SMS Template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    smsTemplateSessionData,
  ]);

  const testUserClient = new TestUserClient();

  test.beforeAll(async () => {
    const username = await testUserClient.createTestUser(
      testUserEmail,
      testUserPassword
    );
    await sessionStorageHelper.seedSessionData(username);
    await testUserClient.deleteTestUser(testUserEmail);
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
  });

  test('should navigate to the SMS template creation page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.signIn(testUserEmail, testUserPassword);

    await createTemplatePage.navigateToCreateSmsTemplatePage(
      smsTemplateSessionData.id
    );

    const smsPricingLinkLocator = page.locator(
      'a[data-testid="sms-pricing-link"]'
    );
    const smsPricingHref = await smsPricingLinkLocator.getAttribute('href');

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-text-message-template/${smsTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create text message template'
    );
    expect(
      smsPricingLinkLocator,
      'SMS pricing link should be visible'
    ).toBeVisible();
    expect(
      smsPricingHref,
      'SMS pricing link should have href /pricing/text-messages'
    ).toBe('/pricing/text-messages');
  });
});
