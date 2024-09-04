import { test, expect } from '@playwright/test';
import { TemplateMgmtCreatePage } from '../pages/template-mgmt-create-page';

test.describe('Create NHS App Template Page', () => {
  test('should navigate to the NHS App template creation page when radio button selected', async ({
    page,
    baseURL,
  }) => {
    const createTemplatePage = new TemplateMgmtCreatePage(page);

    await createTemplatePage.navigateToCreateNhsAppTemplatePage(
      TemplateMgmtCreatePage.nhsAppNoTemplateSessionData.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-nhs-app-template/3d98b0c4-6666-0000-1111-95eb27590000`
    );
    expect(await createTemplatePage.pageHeader.textContent()).toBe(
      'Create NHS App message template'
    );
  });
});
