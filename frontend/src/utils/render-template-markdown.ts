import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import {
  renderEmailMarkdown,
  renderNHSAppMarkdown,
  renderSMSMarkdown,
} from './markdownit';

export function renderTemplateMarkdown(template: TemplateDto): string {
  switch (template.templateType) {
    case 'NHS_APP': {
      return renderNHSAppMarkdown(template.message);
    }

    case 'EMAIL': {
      return renderEmailMarkdown(template.message);
    }

    case 'SMS': {
      return renderSMSMarkdown(template.message);
    }

    default: {
      throw new Error('Unsupported template type');
    }
  }
}
