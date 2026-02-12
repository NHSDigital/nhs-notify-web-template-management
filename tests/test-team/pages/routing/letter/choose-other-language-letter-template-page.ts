import { Locator, type Page } from '@playwright/test';
import { RoutingChooseTemplateForMessagePlanBasePage } from 'pages/routing/choose-template-base-page';

export class RoutingChooseOtherLanguageLetterTemplatePage extends RoutingChooseTemplateForMessagePlanBasePage {
  static readonly pathTemplate =
    '/message-plans/choose-other-language-letter-template/:messagePlanId';

  public readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);

    this.formError = page.locator('#language-templates--error-message');
    this.templatesTable = page.getByTestId('language-templates-table');
    this.tableRows = this.templatesTable.locator('tbody tr');
  }

  getCheckbox(templateId: string): Locator {
    return this.page.getByTestId(`${templateId}-checkbox`);
  }
}
