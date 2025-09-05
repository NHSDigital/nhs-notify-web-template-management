import type { DynamoDBTemplate } from './input-schemas';

const publishableLetterStatuses = new Set<DynamoDBTemplate['templateStatus']>([
  'DELETED',
  'PENDING_PROOF_REQUEST',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'WAITING_FOR_PROOF',
]);

function shouldPublishLetter(
  previous: DynamoDBTemplate | undefined,
  current: DynamoDBTemplate
): boolean {
  if (current.templateStatus === 'DELETED') {
    return (
      previous !== undefined &&
      publishableLetterStatuses.has(previous.templateStatus) &&
      !!current.proofingEnabled
    );
  }

  return (
    publishableLetterStatuses.has(current.templateStatus) &&
    !!current.proofingEnabled
  );
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
