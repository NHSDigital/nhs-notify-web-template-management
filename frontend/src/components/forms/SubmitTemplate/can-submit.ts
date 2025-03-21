import { TemplateDto } from 'nhs-notify-backend-client';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

function canSubmitLetterTemplate(template: LetterTemplate): boolean {
  const { pdfTemplate, testDataCsv, proofs } = template.files;

  const virusScanStatuses = [
    pdfTemplate.virusScanStatus,
    testDataCsv?.virusScanStatus,
    ...(proofs?.map((proof) => proof.virusScanStatus) ?? []),
  ];

  return !virusScanStatuses.some((status) => status !== 'PASSED');
}

export function canSubmit(template: TemplateDto): boolean {
  if (!template) {
    return false;
  }

  if (template.templateStatus !== 'NOT_YET_SUBMITTED') {
    return false;
  }

  if (template.templateType === 'LETTER') {
    return canSubmitLetterTemplate(template as LetterTemplate);
  }

  return true;
}
