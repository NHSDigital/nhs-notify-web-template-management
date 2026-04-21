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
import { TestUser, testUsers } from '../../helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
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
  const context = getTestContext();
  user = await context.auth.getTestUser(testUsers.User1.userId);

  return {
    VALID: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.VALID,
      user,
      `approved-letter-template ${templateIds.VALID}`,
      'PROOF_APPROVED',
      {
        letterVariantId: 'variant',
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    ),

    WRONG_STATUS: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.WRONG_STATUS,
      user,
      `wrong-status-letter-template ${templateIds.WRONG_STATUS}`,
      'NOT_YET_SUBMITTED'
    ),

    PDF_LETTER: TemplateFactory.uploadPdfLetterTemplate(
      templateIds.PDF_LETTER,
      user,
      `pdf-letter-template ${templateIds.PDF_LETTER}`,
      'PROOF_APPROVED'
    ),

    INVALID: {
      id: templateIds.INVALID,
      clientId: user.clientId,
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

    await expect(approvedPage.templateName).toHaveText(templates.VALID.name);
  });

  test('when user visits page, then page contains expected links', async ({
    page,
  }) => {
    const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(
      page
    ).setPathParam('templateId', templates.VALID.id);

    await approvedPage.loadPage();

    await expect(approvedPage.messagePlansLink).toBeVisible();
    await expect(approvedPage.messagePlansLink).toHaveAttribute(
      'href',
      '/templates/message-plans'
    );

    await expect(approvedPage.templatesLink).toBeVisible();
    await expect(approvedPage.templatesLink).toHaveAttribute(
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
