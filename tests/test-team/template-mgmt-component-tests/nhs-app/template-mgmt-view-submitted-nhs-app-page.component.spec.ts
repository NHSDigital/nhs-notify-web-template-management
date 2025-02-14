import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtViewSubmittedNhsAppPage } from '../../pages/nhs-app/template-mgmt-view-submitted-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template, TemplateStatus } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-view-submitted-common.steps';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    valid: {
      ...TemplateFactory.createNhsAppTemplate(
        'valid-nhs-app-template-view-submitted',
        owner
      ),
      name: 'test-template-nhs-app',
      message: 'test-template-message',
      templateStatus: TemplateStatus.SUBMITTED,
    },
    invalid: {
      ...TemplateFactory.createNhsAppTemplate(
        'invalid-nhs-app-template-view-submitted',
        owner
      ),
      name: 'test-template-nhs-app',
      message: 'test-template-message',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  };
}

test.describe('View submitted NHS App message template Page', () => {
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

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const viewSubmittedNHSAppTemplatePage =
      new TemplateMgmtViewSubmittedNhsAppPage(page);

    await viewSubmittedNHSAppTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/view-submitted-nhs-app-template/${templates.valid.id}`
    );

    await expect(viewSubmittedNHSAppTemplatePage.pageHeader).toContainText(
      'test-template-nhs-app'
    );

    await expect(viewSubmittedNHSAppTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtViewSubmittedNhsAppPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with an unsubmitted template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const viewSubmittedNHSAppTemplatePage =
        new TemplateMgmtViewSubmittedNhsAppPage(page);

      await viewSubmittedNHSAppTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const viewSubmittedNHSAppTemplatePage =
        new TemplateMgmtViewSubmittedNhsAppPage(page);

      await viewSubmittedNHSAppTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
