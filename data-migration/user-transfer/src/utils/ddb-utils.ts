import {
  AttributeValue,
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  ScanCommandInput,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { Template } from '@/src/utils/types';

const client = new DynamoDBClient({ region: 'eu-west-2' });

function chunk<T>(list: T[], size = 25): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }

  return chunks;
}

export async function listAllTemplates(tableName: string): Promise<Template[]> {
  const templates: Record<string, AttributeValue>[] = [];

  let lastEvaluatedKey = undefined;
  do {
    const query: ScanCommandInput = {
      TableName: tableName,
      FilterExpression:
        'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
      ExpressionAttributeNames: { '#owner': 'owner', '#id': 'id' },
      ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
      ExclusiveStartKey: lastEvaluatedKey,
      ProjectionExpression: '#id,#owner',
    };

    const queryResult = await client.send(new ScanCommand(query));

    templates.push(...(queryResult.Items ?? []));

    lastEvaluatedKey = queryResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return templates.map((item) => ({
    id: item.id.S!,
    owner: item.owner.S!,
  }));
}

export async function getTemplate(
  tableName: string,
  owner: string,
  templateId: string
) {
  const cmd = new GetItemCommand({
    TableName: tableName,
    Key: {
      owner: { S: owner },
      id: { S: templateId },
    },
  });

  const response = await client.send(cmd);

  return response.Item;
}

export async function getTemplates(
  tableName: string,
  keys: { id: string; owner: string }[]
) {
  const output = [];

  const chunks = chunk(keys, 25);

  for (const chk of chunks) {
    const cmd = new BatchGetItemCommand({
      RequestItems: {
        [tableName]: {
          Keys: chk.map((key) => ({
            id: { S: key.id },
            owner: { S: key.owner },
          })),
        },
      },
    });

    const result = await client.send(cmd);

    if (result.UnprocessedKeys?.[tableName]) {
      throw new Error(
        'unable to get templates due to UnprocessedKeys keys from DynamoDB'
      );
    }

    if (!result.Responses) {
      throw new Error(
        'unable to get templates due to no Responses from DynamoDb'
      );
    }

    output.push(...result.Responses[tableName]);
  }

  return output;
}

export async function migrateOwnership(
  tableName: string,
  template: Record<string, AttributeValue>,
  from: string,
  to: string
) {
  const cmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: {
            ...template,
            owner: { S: `CLIENT#${to}` },
            clientId: { S: to },
            createdBy: { S: from },
            updatedBy: { S: from },
          },
        },
      },
      {
        Delete: {
          TableName: tableName,
          Key: {
            id: template.id,
            owner: template.owner,
          },
        },
      },
    ],
    ReturnConsumedCapacity: 'TOTAL',
  });

  return await client.send(cmd);
}
