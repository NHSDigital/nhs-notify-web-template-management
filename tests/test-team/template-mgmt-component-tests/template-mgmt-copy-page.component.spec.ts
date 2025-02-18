import { test, expect } from '@playwright/test';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import {
  Template,
  TemplateType,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
} from '../helpers/types';
import {
  createAuthHelper,
  TestUser,
  TestUserId,
} from '../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  return {
    email: {
      ...TemplateFactory.createEmailTemplate('email-template-copy-page', owner),
      name: 'email-template-copy-page-name',
      message: 'email-template-copy-page-message',
      subject: 'template-subject',
    },
    sms: {
      ...TemplateFactory.createSmsTemplate('sms-template-copy-page', owner),
      name: 'sms-template-copy-page-name',
      message: 'sms-template-copy-page-message',
    },
    nhsApp: {
      ...TemplateFactory.createNhsAppTemplate('app-template-copy-page', owner),
      name: 'app-template-copy-page-name',
      message: 'app-template-copy-page-message',
    },
  };
}

test.describe('Copy Template Page', () => {
  let user: TestUser;
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(TestUserId.User1);
    templates = createTemplates(user.userId);
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
    const copyTemplatePage = new TemplateMgmtCopyPage(page);

    await copyTemplatePage.loadPage(templates.email.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/copy-template/${templates.email.id}`
    );
    await expect(copyTemplatePage.pageHeader).toHaveText(
      `Copy '${templates.email.name}'`
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtCopyPage(page),
      id: templates.email.id,
      baseURL,
      expectedUrl: 'templates/manage-templates',
    };

    await assertSkipToMainContent(props);
    await assertNotifyBannerLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLink(props);
  });

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page);

    await copyTemplatePage.loadPage(templates.email.id);

    await expect(copyTemplatePage.radioButtons).toHaveCount(4);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page);

    await copyTemplatePage.loadPage(templates.email.id);
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
    for (const targetTemplateType of [
      TemplateType.EMAIL,
      TemplateType.NHS_APP,
      TemplateType.SMS,
    ]) {
      // eslint-disable-next-line no-loop-func
      test(`should copy ${sourceTemplateType} to ${targetTemplateType} template`, async ({
        page,
        baseURL,
      }) => {
        const copyTemplatePage = new TemplateMgmtCopyPage(page);

        const template = templates[sourceTemplateType];
        await copyTemplatePage.loadPage(template.id);
        await copyTemplatePage.checkRadioButton(
          templateTypeDisplayMappings(targetTemplateType)
        );
        await copyTemplatePage.clickContinueButton();

        await expect(page).toHaveURL(`${baseURL}/templates/manage-templates`);

        const templateRow = page
          .getByRole('row')
          .filter({
            has: page.getByText(
              `Type ${templateTypeDisplayMappings(targetTemplateType)}`,
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

        await expect(templateRow).toContainText('Not yet submitted');

        const copyUrl = await templateRow
          .getByText('Copy', { exact: true })
          .getAttribute('href');

        const newTemplateId = copyUrl?.split('/').at(-1);

        expect(
          newTemplateId,
          'Could not determine ID of copied template'
        ).toBeDefined();

        templateStorageHelper.addAdHocTemplateKey({
          id: newTemplateId!,
          owner: user.userId,
        });

        await copyTemplatePage.navigateTo(
          `/templates/preview-${templateTypeToUrlTextMappings(targetTemplateType)}-template/${newTemplateId}`
        );

        await expect(page.getByText(template.message)).toBeVisible();

        if (targetTemplateType === TemplateType.EMAIL) {
          const expectedSubject = template.subject ?? 'Enter a subject line';
          await expect(page.getByText(expectedSubject)).toBeVisible();
        }
      });
    }
  }
});
