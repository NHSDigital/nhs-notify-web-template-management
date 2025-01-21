import { test, expect } from '@playwright/test';
import { TemplateMgmtCopyPage } from '../pages/template-mgmt-copy-page';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLogoutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from './template-mgmt-common.steps';
import { TemplateStorageHelper } from '../helpers/template-storage-helper';
import { TemplateFactory } from '../helpers/template-factory';
import {
  TemplateType,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
} from '../helpers/types';

const templates = {
  email: {
    ...TemplateFactory.createEmailTemplate('email-template-copy-page'),
    name: 'email-template-copy-page-name',
    message: 'email-template-copy-page-message',
    subject: 'template-subject',
  },
  sms: {
    ...TemplateFactory.createSmsTemplate('sms-template-copy-page'),
    name: 'sms-template-copy-page-name',
    message: 'sms-template-copy-page-message',
  },
  nhsApp: {
    ...TemplateFactory.createNhsAppTemplate('app-template-copy-page'),
    name: 'app-template-copy-page-name',
    message: 'app-template-copy-page-message',
  },
};

const extraTemplateIds: string[] = [];

test.describe('Copy Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData(extraTemplateIds);
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
    await assertLogoutLink(props);
    await assertGoBackLink(props);
  });

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page);

    await copyTemplatePage.loadPage(templates.email.id);

    await expect(copyTemplatePage.radioButtons).toHaveCount(3);
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const copyTemplatePage = new TemplateMgmtCopyPage(page);

    await copyTemplatePage.loadPage(templates.email.id);
    await copyTemplatePage.clickSubmitButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/copy-template/${templates.email.id}`
    );

    await expect(copyTemplatePage.errorSummary).toBeVisible();
    await expect(copyTemplatePage.errorSummaryList).toHaveText([
      'Select a template type',
    ]);
  });

  for (const template of Object.values(templates)) {
    for (const targetTemplateType of [
      TemplateType.EMAIL,
      TemplateType.NHS_APP,
      TemplateType.SMS,
    ]) {
      test(`should copy ${template.templateType} to ${targetTemplateType} template`, async ({
        page,
        baseURL,
      }) => {
        const copyTemplatePage = new TemplateMgmtCopyPage(page);

        await copyTemplatePage.loadPage(template.id);
        await copyTemplatePage.checkRadioButton(
          templateTypeDisplayMappings(targetTemplateType)
        );
        await copyTemplatePage.clickSubmitButton();

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

        expect(templateRow).toContainText('Not yet submitted');

        const copyUrl = await templateRow
          .getByText('Copy', { exact: true })
          .getAttribute('href');

        const newTemplateId = copyUrl?.split('/').at(-1);

        if (!newTemplateId) {
          throw new Error('Could not determine ID of copied template');
        }

        extraTemplateIds.push(newTemplateId);

        await copyTemplatePage.navigateTo(
          `/templates/preview-${templateTypeToUrlTextMappings(targetTemplateType)}-template/${newTemplateId}`
        );

        expect(page.getByText(template.message)).toBeVisible();

        if (targetTemplateType === TemplateType.EMAIL) {
          const expectedSubject = template.subject ?? 'Enter a subject line';
          expect(page.getByText(expectedSubject)).toBeVisible();
        }
      });
    }
  }
});
