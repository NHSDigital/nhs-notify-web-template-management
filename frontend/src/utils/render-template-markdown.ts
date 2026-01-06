import type { TemplateDto } from 'nhs-notify-backend-client';
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
      return '';
    }
  }
}
