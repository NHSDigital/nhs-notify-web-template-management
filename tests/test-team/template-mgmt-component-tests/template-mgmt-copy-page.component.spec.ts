import { test, expect } from '@playwright/test';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import {
  assertFooterLinks,
  assertAndClickBackLinkTop,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottomNotPresent,
} from '../helpers/template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import {
  Template,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
} from '../helpers/types';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    email: {
      ...TemplateFactory.createEmailTemplate(
        'dc0fd5d4-b9b0-455a-81f6-2627b59aae9b',
        user
      ),
      name: 'email-template-copy-page-name',
      message: 'email-template-copy-page-message',
      subject: 'template-subject',
    },
    sms: {
      ...TemplateFactory.createSmsTemplate(
        '501e2de6-0253-4d60-9770-0d088aac1aa0',
        user
      ),
      name: 'sms-template-copy-page-name',
      message: 'sms-template-copy-page-message',
    },
    nhsApp: {
      ...TemplateFactory.createNhsAppTemplate(
        '458468e4-db7c-4cc2-ae25-6d86fcc68fcd',
        user
      ),
      name: 'app-template-copy-page-name',
      message: 'app-template-copy-page-message',
    },
    letter: TemplateFactory.uploadLetterTemplate(
      '4697bf0f-4d9c-4fa1-b5ef-a45fd0266856',
      user,
      'letter-template-copy-page-name'
    ),
  };
}

test.describe('Copy Template Page', () => {
  let user: TestUser;
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
    await templateStorageHelper.deleteAdHocTemplates();
  });

  test('should land on "Copy Template" page when navigating to "/copy-template" url', async ({
    page,
    baseURL,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templates.email.id
    );

    await copyTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/copy-template/${templates.email.id}`
    );
    await expect(copyTemplatePage.pageHeading).toHaveText(
      `Copy '${templates.email.name}'`
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCopyPage(page).setPathParam(
        'templateId',
        templates.email.id
      ),
      baseURL,
      expectedUrl: 'templates/message-templates',
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottomNotPresent(props);
    await assertAndClickBackLinkTop(props);
  });

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templates.email.id
    );

    await copyTemplatePage.loadPage();

    await expect(copyTemplatePage.radioButtons).toHaveCount(3);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templates.email.id
    );

    await copyTemplatePage.loadPage();
    await copyTemplatePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/copy-template/${templates.email.id}`
    );

    await expect(copyTemplatePage.errorSummary).toBeVisible();
    await expect(copyTemplatePage.errorSummaryList).toHaveText([
      'Select a template type',
    ]);
  });

  for (const sourceTemplateType of ['nhsApp', 'email', 'sms']) {
    for (const targetTemplateType of ['EMAIL', 'NHS_APP', 'SMS']) {
      // eslint-disable-next-line no-loop-func
      test(`should copy ${sourceTemplateType} to ${targetTemplateType} template`, async ({
        page,
        baseURL,
      }) => {
        const template = templates[sourceTemplateType];

        const copyTemplatePage = new TemplateMgmtCopyPage(page).setPathParam(
          'templateId',
          template.id
        );

        await copyTemplatePage.loadPage();
        await copyTemplatePage.checkRadioButton(
          templateTypeDisplayMappings[targetTemplateType]
        );
        await copyTemplatePage.clickContinueButton();

        await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);

        const templateRow = page
          .getByRole('row')
          .filter({
            has: page.getByText(
              `Type ${templateTypeDisplayMappings[targetTemplateType]}`,
              { exact: true }
            ),
          })
          .filter({
            has: page.getByText(
              new RegExp( // eslint-disable-line security/detect-non-literal-regexp
                `COPY \\([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\\): ${template.name}`
              )
            ),
          })
          .first();

        await expect(templateRow).toContainText('Draft');

        const copyUrl = await templateRow
          .getByText('Copy', { exact: true })
          .getAttribute('href');

        const newTemplateId = copyUrl?.split('/').at(-1);

        expect(
          newTemplateId,
          'Could not determine ID of copied template'
        ).toBeDefined();

        templateStorageHelper.addAdHocTemplateKey({
          templateId: newTemplateId!,
          clientId: user.clientId,
        });

        await copyTemplatePage.navigateTo(
          `/templates/preview-${templateTypeToUrlTextMappings[targetTemplateType]}-template/${newTemplateId}`
        );

        await expect(page.getByText(template.message || '')).toBeVisible();

        if (targetTemplateType === 'EMAIL') {
          const expectedSubject = template.subject ?? 'Enter a subject line';
          await expect(page.getByText(expectedSubject)).toBeVisible();
        }
      });
    }
  }

  test(`when navigating to the copy page for a letter template, invalid template error is displayed`, async ({
    baseURL,
    page,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templates.letter.id
    );

    await copyTemplatePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
