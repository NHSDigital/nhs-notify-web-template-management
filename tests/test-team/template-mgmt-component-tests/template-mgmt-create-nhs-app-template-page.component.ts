import { test, expect } from '@playwright/test';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';
import { Session, TemplateType } from '../helpers/types';
import SessionStorageHelper from '../helpers/session-storage-helper';
import { TestUserClient } from '../helpers/test-user-client';

export const nhsAppNoTemplateSessionData: Session = {
  __typename: 'SessionStorage',
  id: '3d98b0c4-6666-0000-1111-95eb27590000',
  createdAt: '2024-09-19T23:36:20.815Z',
  updatedAt: '2024-09-19T23:36:20.815Z',
  templateType: TemplateType.NHS_APP,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

const testUserEmail = 'create-nhs-app-page@nhs.net';
const testUserPassword = 'Test-Password1';

test.describe('Create NHS App Template Page', () => {
  const sessionStorageHelper = new SessionStorageHelper([
    nhsAppNoTemplateSessionData,
  ]);

  const testUserClient = new TestUserClient();

  test.beforeAll(async () => {
    const username = await testUserClient.createTestUser(
      testUserEmail,
      testUserPassword
    );
    await sessionStorageHelper.seedSessionData(username);
  });

  test.afterAll(async () => {
    await sessionStorageHelper.deleteSessionData();
    await testUserClient.deleteTestUser(testUserEmail);
  });

  test('should navigate to the NHS App template creation page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.signIn(testUserEmail, testUserPassword);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/${nhsAppNoTemplateSessionData.id}`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });
});
