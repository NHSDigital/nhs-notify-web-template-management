import { Locator } from '@playwright/test';
import { TemplateMgmtPreviewSubmittedBasePage } from '../template-mgmt-preview-submitted-base-page';

export class TemplateMgmtPreviewApprovedLetterPage extends TemplateMgmtPreviewSubmittedBasePage {
  static readonly pathTemplate =
    '/preview-approved-letter-template/:templateId';

  public static readonly urlRegexp = new RegExp(
    /\/templates\/preview-approved-letter-template\/([\dA-Fa-f-]+)$/
  );

  public getTab(name: string) {
    const panel = this.page.getByRole('tabpanel', { name });
    const tab = this.page.getByRole('tab', { name });

    const pdsSection = panel.getByRole('region', {
      name: 'PDS personalisation fields',
    });

    const customSection = panel.getByRole('region', {
      name: 'Custom personalisation fields',
    });

    const recipientValue = this.getFieldValue(pdsSection, 'Example recipient');

    return {
      tab,
      panel,
      recipientValue,
      getCustomFieldValue: (fieldName: string) => {
        return this.getFieldValue(customSection, fieldName);
      },
    };
  }

  private getFieldValue(section: Locator, label: string) {
    return section.getByRole('term').filter({ hasText: label }).locator('+ dd');
  }
}
