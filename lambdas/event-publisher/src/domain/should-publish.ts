import {
  TemplateStatus,
  TemplateDto,
  LetterProperties,
} from 'nhs-notify-backend-client';

type LetterTemplateDto = TemplateDto & LetterProperties;

const publishableLetterStatuses = new Set<TemplateStatus>([
  'DELETED',
  'PENDING_PROOF_REQUEST',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'WAITING_FOR_PROOF',
]);

function shouldPublishLetter(data: LetterTemplateDto): boolean {
  return (
    publishableLetterStatuses.has(data.templateStatus) && !!data.proofingEnabled
  );
}

export function shouldPublish(data: TemplateDto) {
  if (data.templateType === 'LETTER') {
    return shouldPublishLetter(data);
  }

  return true;
}
