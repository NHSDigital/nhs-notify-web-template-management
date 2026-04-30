import { test as base, expect, Page } from '@playwright/test';
import { docxFixtures } from 'fixtures/letters';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { getTestContext } from 'helpers/context/context';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { LetterType } from 'nhs-notify-web-template-management-types';
import {
  TemplateMgmtChoosePrintingAndPostagePage,
  TemplateMgmtGetReadyToApproveLetterTemplatePage,
  TemplateMgmtLetterTemplateApprovedPage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtReviewAndApproveLetterTemplatePage,
  TemplateMgmtUploadLargePrintLetterTemplatePage,
  TemplateMgmtUploadStandardEnglishLetterTemplatePage,
} from 'pages/letter';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';
import { TemplateMgmtChoosePage } from 'pages/template-mgmt-choose-page';
import {
  SHORT_EXAMPLE_RECIPIENTS,
  LONG_EXAMPLE_RECIPIENTS,
} from '../../../frontend/src/content/example-recipients';
import { TemplateMgmtMessageTemplatesPage } from 'pages/template-mgmt-message-templates-page';
import { TemplateMgmtUploadLetterBasePage } from 'pages/letter/template-mgmt-upload-letter-base-page';

const context = getTestContext();
const testUser = testUsers.UserWithMultipleCampaigns;

const test = base.extend<{
  chooseTemplateTypePage: TemplateMgmtChoosePage;
  userId: string;
  user: TestUser;
}>({
  user: async ({ page }, use) => {
    const user = await context.auth.getTestUser(testUser.userId);
    await loginAsUser(user, page);
    await use(user);
  },
  chooseTemplateTypePage: async ({ page, user }, use) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);
    await chooseTemplateTypePage.loadPage();
    await chooseTemplateTypePage.getTemplateTypeRadio('letter').click();

    await use(chooseTemplateTypePage);
  },
});

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Letters complete e2e journey', () => {
  const templateStorageHelper = new TemplateStorageHelper();

  test.afterAll(async () => {
    await templateStorageHelper.deleteAdHocTemplates();
  });

  type TestParameter = {
    letterType: LetterType | 'language';
    letterTypeName: string;
    docx: (typeof docxFixtures)[keyof typeof docxFixtures];
    getUploadPage: (page: Page) => TemplateMgmtUploadLetterBasePage;
    personalisationData: Record<string, string>;
    language?: string;
  };

  const t: TestParameter[] = [
    {
      letterType: 'x0',
      letterTypeName: 'Standard English',
      docx: docxFixtures.standard,
      getUploadPage: (page: Page) =>
        new TemplateMgmtUploadStandardEnglishLetterTemplatePage(page),
      personalisationData: {
        gpSurgeryName: 'Test Surgery',
        gpSurgeryAddress: '123 Timbuktu Lane, Kings Landing, KL19 0JE',
        gpSurgeryPhone: '+44 7293 456 099',
      },
    },
    {
      letterType: 'x1',
      letterTypeName: 'Large Print',
      docx: docxFixtures.standard,
      getUploadPage: (page: Page) =>
        new TemplateMgmtUploadLargePrintLetterTemplatePage(page),
      personalisationData: {
        gpSurgeryName: 'Test Surgery',
        gpSurgeryAddress: '123 Timbuktu Lane, Kings Landing, KL19 0JE',
        gpSurgeryPhone: '+44 7293 456 099',
      },
    },
  ];

  for (const {
    letterType,
    letterTypeName,
    docx,
    getUploadPage,
    personalisationData,
    language,
  } of t) {
    test(letterTypeName, async ({ page, chooseTemplateTypePage, user }) => {
      const uploadPage = getUploadPage(page);

      await test.step(`Choose ${letterTypeName} - ${letterType}`, async () => {
        await chooseTemplateTypePage.getLetterTypeRadio(letterType).click();
        await chooseTemplateTypePage.clickContinueButton();

        await expect(page).toHaveURL(
          TemplateMgmtBasePage.appUrlSegment + uploadPage.pathTemplate
        );
      });

      const templateName = 'E2E Test (Andy)';
      const campaignId = user.campaignIds?.[0];
      if (!campaignId) {
        throw new Error(`Invalid campaign id for test user: ${user.userId}`);
      }

      await test.step('Fill upload letter details and submit', async () => {
        await uploadPage.fillForm({
          name: templateName,
          campaignId,
          filePath: docx.filepath,
          language,
        });

        await uploadPage.submitButton.click();

        await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);
      });

      const templateKey =
        await test.step('Ensure template is created with correct details', async () => {
          const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
            page.url()
          );
          expect(
            maybeTemplateId,
            'Template should be defined'
          ).not.toBeUndefined();
          const templateId = maybeTemplateId as string;
          const key = {
            templateId,
            clientId: user.clientId,
          };

          templateStorageHelper.addAdHocTemplateKey(key);

          await expect(async () => {
            const template = await templateStorageHelper.getTemplate(key);
            expect(template.campaignId).toEqual(campaignId);
            expect(template.name).toEqual(templateName);
            expect(template.clientId).toEqual(user.clientId);
            expect(template.letterType).toEqual(letterType);
            expect(template.lockNumber).toEqual(1);
            expect(template.files?.docxTemplate?.fileName).toEqual(
              docx.filename
            );
            expect(template.files?.docxTemplate?.virusScanStatus).toEqual(
              'PASSED'
            );
            expect(template.templateStatus).toEqual('PENDING_VALIDATION');
          }).toPass({ timeout: 40_000 });

          return key;
        });

      const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);

      await test.step('View upload results', async () => {
        await expect(async () => {
          // await page.reload();

          await expect(previewTemplatePage.continueButton).toBeVisible();
          await expect(previewTemplatePage.uploadSuccessBanner).toBeVisible();
          await expect(previewTemplatePage.pageSpinner).toBeHidden();
        }).toPass({ timeout: 40_000 });
      });
    });
  }

  test('Standard English Letter', async ({
    page,
    chooseTemplateTypePage,
    user,
  }) => {
    const letterType: LetterType = 'x0';

    await test.step('Choose standard english letter type', async () => {
      await chooseTemplateTypePage.getLetterTypeRadio(letterType).click();
      await chooseTemplateTypePage.clickContinueButton();

      await expect(page).toHaveURL(
        TemplateMgmtBasePage.appUrlSegment +
          TemplateMgmtUploadStandardEnglishLetterTemplatePage.pathTemplate
      );
    });

    const templateName = 'E2E Test (Andy)';
    const campaignId = user.campaignIds?.[0];
    if (!campaignId) {
      throw new Error(`Invalid campaign id for test user: ${user.userId}`);
    }

    const docx = docxFixtures.standard;

    await test.step('Fill upload letter details and submit', async () => {
      const uploadPage =
        new TemplateMgmtUploadStandardEnglishLetterTemplatePage(page);
      await uploadPage.nameInput.fill(templateName);

      await expect(uploadPage.singleCampaignIdText).toBeHidden();
      await uploadPage.campaignIdInput.selectOption(campaignId);

      await uploadPage.fileInput.click();
      await uploadPage.fileInput.setInputFiles(docx.filepath);

      await uploadPage.submitButton.click();

      await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);
    });

    const templateKey =
      await test.step('Ensure template is created with correct details', async () => {
        const maybeTemplateId = TemplateMgmtPreviewLetterPage.getTemplateId(
          page.url()
        );
        expect(
          maybeTemplateId,
          'Template should be defined'
        ).not.toBeUndefined();
        const templateId = maybeTemplateId as string;
        const key = {
          templateId,
          clientId: user.clientId,
        };

        templateStorageHelper.addAdHocTemplateKey(key);

        await expect(async () => {
          const template = await templateStorageHelper.getTemplate(key);
          expect(template.campaignId).toEqual(campaignId);
          expect(template.name).toEqual(templateName);
          expect(template.clientId).toEqual(user.clientId);
          expect(template.letterType).toEqual(letterType);
          expect(template.lockNumber).toEqual(1);
          expect(template.files?.docxTemplate?.fileName).toEqual(docx.filename);
          expect(template.files?.docxTemplate?.virusScanStatus).toEqual(
            'PASSED'
          );
          expect(template.templateStatus).toEqual('PENDING_VALIDATION');
        }).toPass({ timeout: 40_000 });

        return key;
      });

    const previewTemplatePage = new TemplateMgmtPreviewLetterPage(page);

    await test.step('View upload results', async () => {
      await expect(async () => {
        await page.reload();

        await expect(previewTemplatePage.continueButton).toBeVisible();
        await expect(previewTemplatePage.uploadSuccessBanner).toBeVisible();
        await expect(previewTemplatePage.pageSpinner).toBeHidden();
      }).toPass({ timeout: 40_000 });
    });

    const choosePrintingAndPostagePage =
      new TemplateMgmtChoosePrintingAndPostagePage(page);
    const letterVariants =
      await context.letterVariants.getGlobalLetterVariants();

    const [selectedLetterVariant] = letterVariants;

    await test.step('Select printing and postage', async () => {
      await previewTemplatePage.printingAndPostageAction.click();
      await expect(page).toHaveURL(
        TemplateMgmtChoosePrintingAndPostagePage.urlRegexp
      );

      await choosePrintingAndPostagePage.selectVariant(
        selectedLetterVariant.name
      );
      await choosePrintingAndPostagePage.clickSubmit();

      await expect(page).toHaveURL(TemplateMgmtPreviewLetterPage.urlRegexp);
      await expect(previewTemplatePage.printingAndPostage).toContainText(
        selectedLetterVariant.name
      );
    });

    const { shortTab, longTab } = previewTemplatePage;
    const shortExampleRecipient = SHORT_EXAMPLE_RECIPIENTS[2];
    const longExampleRecipient = LONG_EXAMPLE_RECIPIENTS[2];
    const personalisationData: Record<string, string> = {
      gpSurgeryName: 'Test Surgery',
      gpSurgeryAddress: '123 Timbuktu Lane, Kings Landing, KL19 0JE',
      gpSurgeryPhone: '+44 7293 456 099',
    };

    await test.step('Fill out personalisation fields and update preview', async () => {
      await expect(shortTab.panel).toBeVisible();
      await expect(longTab.panel).toBeHidden();

      await shortTab.selectRecipient({ value: shortExampleRecipient.id });
      for (const key in personalisationData) {
        await shortTab.getCustomFieldInput(key).fill(personalisationData[key]);
      }

      await shortTab.clickUpdatePreview();

      await expect(async () => {
        const template = await templateStorageHelper.getTemplate(templateKey);
        const render = template.files?.shortFormRender;
        expect(render, 'Render should be defined').not.toBeUndefined();
        expect(render?.status, 'with correct status').toEqual('RENDERED');

        const completePersonalisationParams = {
          ...shortExampleRecipient.data,
          ...personalisationData,
        };

        for (const key in render?.personalisationParameters) {
          if (!(key in completePersonalisationParams)) {
            continue;
          }

          expect(
            render?.personalisationParameters[key],
            `'${key}' should equal '${completePersonalisationParams[key]}'`
          ).toEqual(completePersonalisationParams[key]);
        }
      }, 'Persisted short form render is updated with correct personalisation details').toPass(
        { timeout: 40_000 }
      );

      await longTab.clickTab();
      await expect(shortTab.panel).toBeHidden();
      await expect(longTab.panel).toBeVisible();

      await longTab.selectRecipient({ value: longExampleRecipient.id });
      for (const key in personalisationData) {
        await longTab.getCustomFieldInput(key).fill(personalisationData[key]);
      }

      await longTab.clickUpdatePreview();

      await expect(async () => {
        const template = await templateStorageHelper.getTemplate(templateKey);
        const render = template.files?.longFormRender;
        expect(render, 'Render should be defined').not.toBeUndefined();
        expect(render?.status, 'with correct status').toEqual('RENDERED');

        const completePersonalisationParams = {
          ...longExampleRecipient.data,
          ...personalisationData,
        };

        for (const key in render?.personalisationParameters) {
          if (!(key in completePersonalisationParams)) {
            continue;
          }

          expect(
            render?.personalisationParameters[key],
            `'${key}' should equal '${completePersonalisationParams[key]}'`
          ).toEqual(completePersonalisationParams[key]);
        }
      }, 'Persisted long form render is updated with correct personalisation details').toPass(
        { timeout: 40_000 }
      );
    });

    await test.step('Get ready to approve', async () => {
      await previewTemplatePage.continueButton.click();

      await expect(page).toHaveURL(
        TemplateMgmtGetReadyToApproveLetterTemplatePage.urlRegexp
      );

      const getReadyToApprovePage =
        new TemplateMgmtGetReadyToApproveLetterTemplatePage(page);

      await getReadyToApprovePage.continueButton.click();
    });

    await test.step('Review and approve', async () => {
      const reviewAndApprovePage =
        new TemplateMgmtReviewAndApproveLetterTemplatePage(page);

      await expect(page).toHaveURL(
        TemplateMgmtReviewAndApproveLetterTemplatePage.urlRegexp
      );

      await expect(reviewAndApprovePage.shortRenderIFrame).toBeAttached();
      await expect(reviewAndApprovePage.longRenderIFrame).toBeAttached();

      await reviewAndApprovePage.clickApproveButton();

      await expect(page).toHaveURL(
        TemplateMgmtLetterTemplateApprovedPage.urlRegexp
      );

      const approvedPage = new TemplateMgmtLetterTemplateApprovedPage(page);
      await expect(approvedPage.templateName).toContainText(templateName);
      await approvedPage.templatesLink.click();
    });

    await test.step('Template is listed and approved', async () => {
      await expect(page).toHaveURL(
        `/templates${TemplateMgmtMessageTemplatesPage.pathTemplate}`
      );

      const templatesPage = new TemplateMgmtMessageTemplatesPage(page);
      const templateRow = await templatesPage.getTemplatesTableRowByTemplateId(
        templateKey.templateId
      );
      const templateStatus = await templatesPage.getTemplateStatus(
        templateKey.templateId
      );

      await expect(templateRow).toBeAttached();
      expect(templateStatus).toEqual('Approved');
    });
  });
});
