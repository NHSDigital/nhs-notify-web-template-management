import type { DynamoDBTemplate } from './input-schemas';

const publishableLetterStatuses = new Set<DynamoDBTemplate['templateStatus']>([
  'DELETED',
  'PENDING_PROOF_REQUEST',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'WAITING_FOR_PROOF',
]);

function shouldPublishLetter(
  current: DynamoDBTemplate,
  previous: DynamoDBTemplate
): boolean {
  return (
    publishableLetterStatuses.has(current.templateStatus) &&
    publishableLetterStatuses.has(previous.templateStatus) &&
    !!current.proofingEnabled
  );
}

export function shouldPublish(
  current: DynamoDBTemplate,
  previous: DynamoDBTemplate
) {
  if (current.templateType === 'LETTER') {
    return shouldPublishLetter(current, previous);
  }

  return true;
}
