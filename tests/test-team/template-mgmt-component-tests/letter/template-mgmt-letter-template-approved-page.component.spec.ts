import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertNoBackLinks,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtLetterTemplateApprovedPage } from '../../pages/letter/template-mgmt-letter-template-approved-page';
import { randomUUID } from 'node:crypto';

let user: TestUser;

const templateIds = {
  VALID: randomUUID(),
  WRONG_STATUS: randomUUID(),
  PDF_LETTER: randomUUID(),
  INVALID: randomUUID(),
};

async function createTemplates() {
  const authHelper = createAuthHelper();
  user = await authHelper.getTestUser(
    testUsers.UserLetterAuthoringEnabled.userId
  );

  return {
    VALID: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.VALID,
      user,
      'approved-letter-template',
      'PROOF_APPROVED'
    ),

    WRONG_STATUS: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.WRONG_STATUS,
      user,
      'wrong-status-letter-template',
      'NOT_YET_SUBMITTED'
    ),

    PDF_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.PDF_LETTER,
      user,
      'pdf-letter-template',
      'NOT_YET_SUBMITTED'
    ),

    INVALID: {
      id: templateIds.INVALID,
      version: 1,
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
      letterVersion: 'AUTHORING',
    } as Template,
  };
}

test.describe('Letter Template Approved Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page with a valid approved template, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
      page
    ).setPathParam('templateId', templates.VALID.id);

    await approvedPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/letter-template-approved/${templates.VALID.id}`
    );

    await expect(approvedPage.pageHeading).toHaveText(
      'Letter template approved'
    );

    await expect(
      page.locator('dd', { hasText: templates.VALID.name })
    ).toBeVisible();
  });

  test('when user visits page, then page contains expected links', async ({
    page,
  }) => {
    const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
      page
    ).setPathParam('templateId', templates.VALID.id);

    await approvedPage.loadPage();

    const messagePlansLink = page.getByRole('link', {
      name: 'message plans',
    });

    await expect(messagePlansLink).toBeVisible();
    await expect(messagePlansLink).toHaveAttribute(
      'href',
      '/templates/message-plans'
    );

    const templatesLink = page.getByRole('link', {
      name: 'templates',
      exact: true,
    });

    await expect(templatesLink).toBeVisible();
    await expect(templatesLink).toHaveAttribute(
      'href',
      '/templates/message-templates'
    );
  });

  test.describe('Error handling', () => {
    test('when user visits page with a non-existent template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
        page
      ).setPathParam('templateId', 'fake-template-id');

      await approvedPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with invalid template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
        page
      ).setPathParam('templateId', templates.INVALID.id);

      await approvedPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a PDF letter template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
        page
      ).setPathParam('templateId', templates.PDF_LETTER.id);

      await approvedPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a template that is not PROOF_APPROVED, then user is redirected to preview page', async ({
      baseURL,
      page,
    }) => {
      const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
        page
      ).setPathParam('templateId', templates.WRONG_STATUS.id);

      await approvedPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-letter-template/${templates.WRONG_STATUS.id}`
      );
    });
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtLetterTemplateApprovedPage(page).setPathParam(
        'templateId',
        templates.VALID.id
      ),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertSignOutLink(props);
    await assertFooterLinks(props);
    await assertNoBackLinks(props);
  });
});
