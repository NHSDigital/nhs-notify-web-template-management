import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { Parameters } from '@/src/utils/constants';

const client = new DynamoDBClient({ region: 'eu-west-2' });

// change 'sandbox' back to 'app' when testing on prod environment
function getTableName(environment: string) {
  return `nhs-notify-${environment}-sandbox-api-templates`;
}

export async function retrieveAllTemplates(
  parameters: Parameters
): Promise<Record<string, AttributeValue>[]> {
  let allItems: Record<string, AttributeValue>[] = [];
  let lastEvaluatedKey = undefined;
  do {
    const query: ScanCommandInput = {
      TableName: getTableName(parameters.environment),
      FilterExpression:
        'attribute_exists(#owner) AND NOT contains(#owner, :subString)',
      ExpressionAttributeNames: { '#owner': 'owner' },
      ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
    };

    const queryResult = await client.send(new ScanCommand(query));
    lastEvaluatedKey = queryResult.LastEvaluatedKey;
    allItems = [...allItems, ...(queryResult.Items ?? [])];
  } while (lastEvaluatedKey);
  return allItems;
}

export async function retrieveTemplates(
  parameters: Parameters
): Promise<Record<string, AttributeValue>[]> {
  let allItems: Record<string, AttributeValue>[] = [];
  let lastEvaluatedKey = undefined;
  do {
    const query: QueryCommandInput = {
      TableName: getTableName(parameters.environment),
      KeyConditionExpression: '#owner = :owner',
      ExpressionAttributeNames: {
        '#owner': 'owner',
      },
      ExpressionAttributeValues: {
        ':owner': { S: parameters.sourceOwner as string },
      },
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const queryResult = await client.send(new QueryCommand(query));
    lastEvaluatedKey = queryResult.LastEvaluatedKey;
    allItems = [...allItems, ...(queryResult.Items ?? [])];
  } while (lastEvaluatedKey);
  return allItems;
}

export async function updateItem(
  item: Record<string, AttributeValue>,
  parameters: Parameters,
  newClientId: string
): Promise<void> {
  const tableName = getTableName(parameters.environment);
  console.log({ item, parameters, newClientId, tableName });
  await client.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            Item: {
              ...item,
              owner: { S: `CLIENT#${newClientId}` },
              clientId: { S: newClientId },
              createdBy: item.owner,
              updatedBy: item.owner,
            },
            TableName: tableName,
          },
        },
        {
          Delete: {
            Key: {
              owner: item.owner,
            },
            TableName: tableName,
          },
        },
      ],
    })
  );
}
