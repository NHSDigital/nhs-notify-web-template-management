/* eslint-disable sonarjs/use-type-alias */
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  NativeAttributeValue,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { logger } from './logger';

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const TEMPLATES_TABLE_NAME = (env: string) =>
  `nhs-notify-${env}-app-api-templates`;
const ROUTING_TABLE_NAME = (env: string) =>
  `nhs-notify-${env}-app-api-routing-configuration`;

export async function retrieveAllTemplates(
  env: string
): Promise<Record<string, NativeAttributeValue>[]> {
  return retrieveAllRecords(TEMPLATES_TABLE_NAME(env));
}

export async function retrieveAllRoutingConfigurations(
  env: string
): Promise<Record<string, NativeAttributeValue>[]> {
  return retrieveAllRecords(ROUTING_TABLE_NAME(env));
}

async function retrieveAllRecords(
  tableName: string
): Promise<Record<string, NativeAttributeValue>[]> {
  let lastEvaluatedKey = undefined;
  let items: Record<string, NativeAttributeValue>[] = [];
  do {
    const scanCommandInput: ScanCommandInput = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    const result = await ddbDocClient.send(new ScanCommand(scanCommandInput));
    items = [...items, ...(result.Items ?? [])];
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  return items;
}

export async function updateTemplateRecord(
  env: string,
  templateRecord: Record<string, NativeAttributeValue>,
  newCreatedBy?: string,
  newUpdatedBy?: string
): Promise<'success' | 'lock-failure' | 'other-error'> {
  const tableName = TEMPLATES_TABLE_NAME(env);

  return updateRecord(
    tableName,
    'template',
    templateRecord,
    newCreatedBy,
    newUpdatedBy
  );
}

export async function updateRoutingConfigurationRecord(
  env: string,
  routingConfigurationRecord: Record<string, NativeAttributeValue>,
  newCreatedBy?: string,
  newUpdatedBy?: string
): Promise<'success' | 'lock-failure' | 'other-error'> {
  const tableName = ROUTING_TABLE_NAME(env);

  return updateRecord(
    tableName,
    'routing configuration',
    routingConfigurationRecord,
    newCreatedBy,
    newUpdatedBy
  );
}

async function updateRecord(
  tableName: string,
  entityName: 'template' | 'routing configuration',
  record: Record<string, NativeAttributeValue>,
  newCreatedBy?: string,
  newUpdatedBy?: string
): Promise<'success' | 'lock-failure' | 'other-error'> {
  const updateCommandInput: UpdateCommandInput = {
    TableName: tableName,
    Key: {
      owner: record.owner,
      id: record.id,
    },
    UpdateExpression: 'SET createdBy = :createdBy, updatedBy = :updatedBy',
    ConditionExpression:
      'attribute_not_exists(#lockNumber) OR #lockNumber = :expectedLockNumber',
    ReturnValues: 'ALL_NEW',
    ExpressionAttributeNames: {
      '#lockNumber': 'lockNumber',
    },
    ExpressionAttributeValues: {
      ':expectedLockNumber': record.lockNumber ?? 0,
      ':createdBy': newCreatedBy ?? record.createdBy,
      ':updatedBy': newUpdatedBy ?? record.updatedBy,
    },
  };

  try {
    await ddbDocClient.send(new UpdateCommand(updateCommandInput));
    return 'success';
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return 'lock-failure';
    }
    logger.error(
      `Error updating ${entityName} record ID ${record.id}: ${error}`
    );
    logger.error(error);
    return 'other-error';
  }
}
