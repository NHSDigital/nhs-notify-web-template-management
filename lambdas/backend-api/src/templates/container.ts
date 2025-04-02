import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { EventsClient } from './infra/events-client';
import { loadConfig } from './infra/config';

export function createContainer() {
  const config = loadConfig();

  const eventsClient = new EventsClient(
    config.eventSource,
    config.eventBusName
  );
  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    config.templatesTableName,
    eventsClient
  );

  const letterUploadRepository = new LetterUploadRepository(
    config.quarantineBucket,
    config.internalBucket
  );

  const templateClient = new TemplateClient(
    config.enableLetters,
    templateRepository,
    letterUploadRepository
  );

  return {
    templateClient,
    templateRepository,
    letterUploadRepository,
  };
}
