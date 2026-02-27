import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TestUser } from 'helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  assertAndClickBackLinkBottom,
  assertBackLinkTopNotPresent,
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TemplateMgmtChoosePrintingAndPostagePage } from 'pages/letter/template-mgmt-choose-printing-and-postage-page';
import { TemplateMgmtPreviewLetterPage } from 'pages/letter/template-mgmt-preview-letter-page';

test.describe('Choose Printing and Postage page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const templateStorageHelper = new TemplateStorageHelper();
  const context = getTestContext();

  let userLetterAuthoringEnabled: TestUser;
  let userLetterAuthoringDisabled: TestUser;

  test.beforeAll(async () => {
    const clientLetterAuthoringEnabled = await context.clients.createClient({
      campaignIds: ['Campaign 1'],
      features: {
        proofing: false,
        letterAuthoring: true,
      },
    });

    const clientLetterAuthoringDisabled = await context.clients.createClient({
      campaignIds: ['Campaign 1'],
      features: {
        proofing: false,
        letterAuthoring: false,
      },
    });

    userLetterAuthoringEnabled = await context.auth.createAdHocUser(
      clientLetterAuthoringEnabled
    );

    userLetterAuthoringDisabled = await context.auth.createAdHocUser(
      clientLetterAuthoringDisabled
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test.describe('with letter authoring enabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userLetterAuthoringEnabled, page);
    });

    test('common page tests', async ({ page, baseURL }) => {
      const [globalVariant] =
        await context.letterVariants.getGlobalLetterVariants();

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: globalVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const props = {
        page: new TemplateMgmtChoosePrintingAndPostagePage(page)
          .setPathParam('templateId', template.id)
          .setSearchParam('lockNumber', String(template.lockNumber)),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkTopNotPresent(props);
      await assertAndClickBackLinkBottom({
        ...props,
        expectedUrl: `templates/preview-letter-template/${template.id}`,
      });
    });

    test('displays available letter variants in a table - no campaign variants shown if template has no campaign id', async ({
      page,
    }) => {
      const globalVariants =
        await context.letterVariants.getGlobalLetterVariants();

      const clientVariants =
        await context.letterVariants.getClientScopedLetterVariants(
          userLetterAuthoringEnabled.clientId
        );

      const [selectedVariant] = globalVariants;

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: selectedVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(choosePage.pageHeading).toHaveText(
        'Choose a printing and postage option'
      );

      const expectedVariantCount =
        globalVariants.length + clientVariants.length;

      await expect(choosePage.variantsTable.locator('tbody tr')).toHaveCount(
        expectedVariantCount
      );
    });

    test('displays available letter variants in a table including the campaign scoped ones when template has a campaign', async ({
      page,
    }) => {
      const globalVariants =
        await context.letterVariants.getGlobalLetterVariants();

      const clientVariants =
        await context.letterVariants.getClientScopedLetterVariants(
          userLetterAuthoringEnabled.clientId
        );

      const campaignVariants =
        await context.letterVariants.getCampaignScopedLetterVariants(
          userLetterAuthoringEnabled.clientId,
          'Campaign 1'
        );

      const [selectedVariant] = globalVariants;

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: selectedVariant.id, campaignId: 'Campaign 1' }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(choosePage.pageHeading).toHaveText(
        'Choose a printing and postage option'
      );

      const expectedVariantCount =
        globalVariants.length + clientVariants.length + campaignVariants.length;

      await expect(choosePage.variantsTable.locator('tbody tr')).toHaveCount(
        expectedVariantCount
      );
    });

    test('updates the template with selected variant and redirects to preview page', async ({
      page,
    }) => {
      const [globalVariant, globalVariant2] =
        await context.letterVariants.getGlobalLetterVariants();

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: globalVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(choosePage.getRadioInput(globalVariant.name)).toBeChecked();

      await choosePage.selectVariant(globalVariant2.name);
      await choosePage.clickSubmit();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );

      const previewPage = new TemplateMgmtPreviewLetterPage(page);
      await expect(previewPage.printingAndPostage).toContainText(
        globalVariant2.name
      );
    });

    test('shows error when submitting without selecting a variant', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(choosePage.errorSummary).toBeHidden();

      await choosePage.clickSubmit();

      await expect(page).toHaveURL(
        `/templates/choose-printing-and-postage/${template.id}?lockNumber=${template.lockNumber}`
      );

      await expect(choosePage.errorSummaryList).toHaveText([
        'Choose a printing and postage option',
      ]);
    });

    test("redirects to invalid template page if template doesn't exist", async ({
      page,
    }) => {
      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', 'no-exist')
        .setSearchParam('lockNumber', '1');

      await choosePage.loadPage();

      await expect(page).toHaveURL('/templates/invalid-template');
    });

    test('redirects to template list page if template type is NHS_APP', async ({
      page,
    }) => {
      const template = TemplateFactory.createNhsAppTemplate(
        randomUUID(),
        userLetterAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is EMAIL', async ({
      page,
    }) => {
      const template = TemplateFactory.createEmailTemplate(
        randomUUID(),
        userLetterAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is SMS', async ({
      page,
    }) => {
      const template = TemplateFactory.createSmsTemplate(
        randomUUID(),
        userLetterAuthoringEnabled
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template preview page if template is a PDF letter', async ({
      page,
    }) => {
      const template = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'PDF Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });

    test('redirects to preview submitted template page if template is submitted', async ({
      page,
    }) => {
      const [globalVariant] =
        await context.letterVariants.getGlobalLetterVariants();

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'SUBMITTED',
        { letterVariantId: globalVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-submitted-letter-template/${template.id}`
      );
    });

    test('redirects to preview page when lockNumber query parameter is missing', async ({
      page,
    }) => {
      const [globalVariant] =
        await context.letterVariants.getGlobalLetterVariants();

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: globalVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(
        page
      ).setPathParam('templateId', template.id);

      await choosePage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });

    test('redirects to preview page when lockNumber query parameter is invalid', async ({
      page,
    }) => {
      const [globalVariant] =
        await context.letterVariants.getGlobalLetterVariants();

      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringEnabled,
        'Letter Template',
        'NOT_YET_SUBMITTED',
        { letterVariantId: globalVariant.id }
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', 'invalid');

      await choosePage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });
  });

  test.describe('with letter authoring disabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userLetterAuthoringDisabled, page);
    });

    test('redirects to template list page', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userLetterAuthoringDisabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const choosePage = new TemplateMgmtChoosePrintingAndPostagePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await choosePage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });
  });
});
