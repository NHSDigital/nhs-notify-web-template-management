import type { DynamoDBTemplate } from './input-schemas';

const publishableLetterStatuses = new Set<DynamoDBTemplate['templateStatus']>([
  'DELETED',
  'PENDING_PROOF_REQUEST',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'WAITING_FOR_PROOF',
]);

function shouldPublishLetter(data: DynamoDBTemplate): boolean {
  return (
    publishableLetterStatuses.has(data.templateStatus) && !!data.proofingEnabled
  );
}

export function shouldPublish(data: DynamoDBTemplate) {
  if (data.templateType === 'LETTER') {
    return shouldPublishLetter(data);
  }

  return true;
}
