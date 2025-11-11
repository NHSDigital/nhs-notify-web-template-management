import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateRepository } from '../infra';
import { loadConfig } from '../infra/config';

export const templateRepositoryContainer = () => {
  const { templatesTableName } = loadConfig();

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    templatesTableName
  );

  return {
    templateRepository,
    logger,
  };
};
