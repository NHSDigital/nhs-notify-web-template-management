import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LetterVariantClient } from '@backend-api/app/letter-variant-client';
import { loadConfig } from '@backend-api/infra/config';
import { LetterVariantRepository } from '@backend-api/infra/letter-variant-repository';

const awsConfig = { region: 'eu-west-2' };

export const letterVariantContainer = () => {
  const { letterVariantTableName, letterVariantCacheTtlMs } = loadConfig();

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(awsConfig),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const letterVariantRepository = new LetterVariantRepository(
    ddbDocClient,
    letterVariantTableName,
    letterVariantCacheTtlMs
  );

  const letterVariantClient = new LetterVariantClient(letterVariantRepository);

  return {
    letterVariantClient,
  };
};
