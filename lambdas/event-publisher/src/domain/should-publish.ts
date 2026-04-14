import type {
  DynamoDBTemplate,
  DynamoDBTemplateOldImage,
} from './input-schemas';

const publishableAuthoringLetterStatuses = new Set<
  DynamoDBTemplate['templateStatus']
>(['DELETED', 'SUBMITTED', 'PROOF_APPROVED']);

function shouldPublishLetter(
  previous: DynamoDBTemplateOldImage | undefined,
  current: DynamoDBTemplate
): boolean {
  if (current.letterVersion !== 'AUTHORING') {
    return false;
  }

  if (current.templateStatus === 'DELETED') {
    return (
      previous !== undefined &&
      publishableAuthoringLetterStatuses.has(previous.templateStatus)
    );
  }

  return publishableAuthoringLetterStatuses.has(current.templateStatus);
}

export function shouldPublish(
  previous: DynamoDBTemplateOldImage | undefined,
  current: DynamoDBTemplate
) {
  if (current.templateType === 'LETTER') {
    return shouldPublishLetter(previous, current);
  }

  return true;
}
