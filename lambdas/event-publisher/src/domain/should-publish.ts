import type { DynamoDBTemplate } from './input-schemas';

const publishableLetterStatuses = new Set<DynamoDBTemplate['templateStatus']>([
  'DELETED',
  'PENDING_PROOF_REQUEST',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'WAITING_FOR_PROOF',
  'TEMPLATE_PROOF_APPROVED',
]);

function shouldPublishLetter(
  previous: DynamoDBTemplate | undefined,
  current: DynamoDBTemplate
): boolean {
  if (!current.proofingEnabled) return false;

  if (current.templateStatus === 'DELETED') {
    return (
      previous !== undefined &&
      publishableLetterStatuses.has(previous.templateStatus)
    );
  }

  return publishableLetterStatuses.has(current.templateStatus);
}

export function shouldPublish(
  previous: DynamoDBTemplate | undefined,
  current: DynamoDBTemplate
) {
  if (current.templateType === 'LETTER') {
    return shouldPublishLetter(previous, current);
  }

  return true;
}
