import { Locator, Page } from '@playwright/test';
import { TemplateMgmtBasePage } from '../template-mgmt-base-page';

export class TemplateMgmtCreateEmailPage extends TemplateMgmtBasePage {
  public readonly nameInput: Locator;

  public readonly subjectLineInput: Locator;

  public readonly messageTextArea: Locator;

  public readonly errorSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('[id="emailTemplateName"]');
    this.subjectLineInput = page.locator('[id="emailTemplateSubjectLine"]');
    this.messageTextArea = page.locator('[id="emailTemplateMessage"]');
    this.errorSummary = page.locator('[class="nhsuk-error-summary"]');
  }

  async loadPage(sessionId: string) {
    await this.navigateTo(`/templates/create-email-template/${sessionId}`);
  }
}
