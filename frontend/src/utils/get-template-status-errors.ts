import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const {
  validationError,
  validationErrorAction,
  virusScanError,
  virusScanErrorAction,
} = content.components.previewLetterTemplate;

/**
 * Get page-level errors based on template status.
 * These are errors that should be displayed in the error summary at page load.
 */
export function getTemplateStatusErrors(template: LetterTemplate): string[] {
  const errors: string[] = [];

  if (template.templateStatus === 'VIRUS_SCAN_FAILED') {
    errors.push(virusScanError, virusScanErrorAction);
  }

  if (template.templateStatus === 'VALIDATION_FAILED') {
    errors.push(validationError, validationErrorAction);
  }

  return errors;
}
