import { Locator, Page } from '@playwright/test';
import { TemplateMgmtPreviewBasePage } from '../template-mgmt-preview-base-page';

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

  // LetterRender component (AUTHORING)
  public readonly letterPreviewSection: Locator;
  public readonly shortExamplesTab: Locator;
  public readonly longExamplesTab: Locator;

  // Short tab form elements
  public readonly shortRecipientSelect: Locator;
  public readonly shortUpdatePreviewButton: Locator;
  public readonly shortPreviewIframe: Locator;

  // Long tab form elements
  public readonly longRecipientSelect: Locator;
  public readonly longUpdatePreviewButton: Locator;
  public readonly longPreviewIframe: Locator;

  constructor(page: Page) {
    super(page);
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
    this.continueButton = page.locator('[id="preview-letter-template-cta"]');
    this.statusTag = page.getByTestId('status-tag');
    this.pdfLinks = page.locator('[data-testid^="proof-link"]');
    this.editNameLink = page.getByTestId('edit-name-link');
    this.sheetsAction = page.getByTestId('sheets-action');
    this.statusAction = page.getByTestId('status-action');
    this.campaignAction = page.getByTestId('campaign-action');

    // LetterRender component locators
    this.letterPreviewSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Letter preview' }),
    });
    this.shortExamplesTab = page.getByRole('tab', { name: 'Short examples' });
    this.longExamplesTab = page.getByRole('tab', { name: 'Long examples' });

    // Short tab panel form elements
    const shortTabPanel = page.getByRole('tabpanel', { name: 'Short examples' });
    this.shortRecipientSelect = shortTabPanel.locator(
      'select[name="systemPersonalisationPackId"]'
    );
    this.shortUpdatePreviewButton = shortTabPanel.getByRole('button', {
      name: 'Update preview',
    });
    this.shortPreviewIframe = shortTabPanel.locator(
      'iframe[title*="Letter preview"]'
    );

    // Long tab panel form elements
    const longTabPanel = page.getByRole('tabpanel', { name: 'Long examples' });
    this.longRecipientSelect = longTabPanel.locator(
      'select[name="systemPersonalisationPackId"]'
    );
    this.longUpdatePreviewButton = longTabPanel.getByRole('button', {
      name: 'Update preview',
    });
    this.longPreviewIframe = longTabPanel.locator(
      'iframe[title*="Letter preview"]'
    );
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
