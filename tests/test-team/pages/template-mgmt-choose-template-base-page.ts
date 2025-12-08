import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePageDynamic } from './template-mgmt-base-page-dynamic';

export abstract class TemplateMgmtChooseTemplateForMessagePlanBasePage extends TemplateMgmtBasePageDynamic {
  readonly messagePlanName: Locator;

  readonly tableHintText: Locator;

  readonly saveAndContinueButton: Locator;

  readonly noTemplatesMessage: Locator;

  readonly goToTemplatesLink: Locator;

  readonly previousSelectionDetails: Locator;

  formError: Locator;

  templatesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.messagePlanName = page.locator('.nhsuk-caption-l');
    this.tableHintText = page.getByTestId('table-hint');
    this.saveAndContinueButton = page.getByTestId('submit-button');
    this.noTemplatesMessage = page.getByTestId('no-templates-message');
    this.goToTemplatesLink = page.getByTestId('go-to-templates-link');
    this.previousSelectionDetails = page.getByTestId(
      'previous-selection-details'
    );
    this.formError = page.locator('#channel-template--error-message');
    this.templatesTable = page.getByTestId('channel-templates-table');
  }

  getPreviewLink(templateId: string): Locator {
    return this.page.getByTestId(`${templateId}-preview-link`);
  }

  getRadioButton(templateId: string): Locator {
    return this.page.getByTestId(`${templateId}-radio`);
  }
}
