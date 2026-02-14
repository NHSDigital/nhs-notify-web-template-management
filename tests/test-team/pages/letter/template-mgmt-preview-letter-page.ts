import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

type TabVariant = 'short' | 'long';

export class TemplateMgmtPreviewLetterPage extends TemplateMgmtPreviewBasePage {
  static readonly pathTemplate = '/preview-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/preview-letter-template\/([\dA-Fa-f-]+)(?:\?from=edit)?$/
  );

  public readonly errorSummary: Locator;
  public readonly continueButton: Locator;
  public readonly statusTag: Locator;

  // PDF letter specific
  public readonly pdfLinks: Locator;

  // AUTHORING letter specific
  public readonly editNameLink: Locator;
  public readonly sheetsAction: Locator;
  public readonly statusAction: Locator;
  public readonly campaignAction: Locator;

  public readonly letterRender: Locator;

  public readonly shortTab: ReturnType<TemplateMgmtPreviewLetterPage['getTab']>;
  public readonly longTab: ReturnType<TemplateMgmtPreviewLetterPage['getTab']>;

  constructor(page: Page) {
    super(page);

    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.continueButton = page.locator('[id="preview-letter-template-cta"]');
    this.statusTag = page.getByTestId('status-tag');

    // PDF letter specific
    this.pdfLinks = page.locator('[data-testid^="proof-link"]');

    // AUTHORING letter specific
    this.editNameLink = page.getByTestId('edit-name-link');
    this.sheetsAction = page.getByTestId('sheets-action');
    this.statusAction = page.getByTestId('status-action');
    this.campaignAction = page.getByTestId('campaign-action');

    this.letterRender = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Letter preview' }),
    });

    this.shortTab = this.getTab('short');
    this.longTab = this.getTab('long');
  }

  public getTab(variant: TabVariant) {
    const tabName = variant === 'short' ? 'Short examples' : 'Long examples';
    const panel = this.page.getByRole('tabpanel', { name: tabName });
    const tab = this.page.getByRole('tab', { name: tabName });
    const recipientSelect = panel.locator(
      'select[name="systemPersonalisationPackId"]'
    );
    const updatePreviewButton = panel.getByRole('button', {
      name: 'Update preview',
    });

    return {
      tab,
      panel,
      recipientSelect,
      updatePreviewButton,
      previewIframe: panel.locator('iframe[title*="Letter preview"]'),
      customFieldsHeading: panel.getByRole('heading', {
        name: 'Custom personalisation fields',
      }),
      getCustomFieldInput: (fieldName: string): Locator =>
        panel.locator(`input[id="custom-${fieldName}-${variant}"]`),
      getRecipientOptions: (): Locator =>
        panel.locator('select[name="systemPersonalisationPackId"] option'),
      async clickTab() {
        await tab.click();
      },
      async clickUpdatePreview() {
        await updatePreviewButton.click();
      },
      async selectRecipient(options: { index?: number; value?: string }) {
        await recipientSelect.selectOption(options);
      },
    };
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  static getTemplateId(url: string) {
    const matches = url.match(TemplateMgmtPreviewLetterPage.urlRegexp);

    if (matches && matches[1]) {
      return matches[1];
    }
  }
}
