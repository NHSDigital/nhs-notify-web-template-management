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
  public readonly shortCustomFieldsHeading: Locator;

  // Long tab form elements
  public readonly longRecipientSelect: Locator;
  public readonly longUpdatePreviewButton: Locator;
  public readonly longPreviewIframe: Locator;
  public readonly longCustomFieldsHeading: Locator;

  // Tab panels for accessing custom fields
  private readonly shortTabPanel: Locator;
  private readonly longTabPanel: Locator;

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
    this.shortTabPanel = page.getByRole('tabpanel', { name: 'Short examples' });
    this.shortRecipientSelect = this.shortTabPanel.locator(
      'select[name="systemPersonalisationPackId"]'
    );
    this.shortUpdatePreviewButton = this.shortTabPanel.getByRole('button', {
      name: 'Update preview',
    });
    this.shortPreviewIframe = this.shortTabPanel.locator(
      'iframe[title*="Letter preview"]'
    );
    this.shortCustomFieldsHeading = this.shortTabPanel.getByRole('heading', {
      name: 'Custom personalisation fields',
    });

    // Long tab panel form elements
    this.longTabPanel = page.getByRole('tabpanel', { name: 'Long examples' });
    this.longRecipientSelect = this.longTabPanel.locator(
      'select[name="systemPersonalisationPackId"]'
    );
    this.longUpdatePreviewButton = this.longTabPanel.getByRole('button', {
      name: 'Update preview',
    });
    this.longPreviewIframe = this.longTabPanel.locator(
      'iframe[title*="Letter preview"]'
    );
    this.longCustomFieldsHeading = this.longTabPanel.getByRole('heading', {
      name: 'Custom personalisation fields',
    });
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  /**
   * Get a custom personalisation field input for the short tab
   */
  getShortCustomFieldInput(fieldName: string): Locator {
    return this.shortTabPanel.locator(`input[id="custom-${fieldName}-short"]`);
  }

  /**
   * Get a custom personalisation field input for the long tab
   */
  getLongCustomFieldInput(fieldName: string): Locator {
    return this.longTabPanel.locator(`input[id="custom-${fieldName}-long"]`);
  }

  /**
   * Get all recipient options from the short tab dropdown
   */
  getShortRecipientOptions(): Locator {
    return this.shortRecipientSelect.locator('option');
  }

  /**
   * Get all recipient options from the long tab dropdown
   */
  getLongRecipientOptions(): Locator {
    return this.longRecipientSelect.locator('option');
  }

  static getTemplateId(url: string) {
    const matches = url.match(TemplateMgmtPreviewLetterPage.urlRegexp);

    if (matches && matches[1]) {
      return matches[1];
    }
  }
}
