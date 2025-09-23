import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/client-dynamodb';
import { Parameters } from '@/src/utils/constants';
import { UserData } from './cognito-utils';

const client = new DynamoDBClient({ region: 'eu-west-2' });

function getTableName(parameters: Parameters) {
  const { environment, component } = parameters;
  return `nhs-notify-${environment}-${component}-api-templates`;
}

export async function retrieveAllTemplates(
  parameters: Parameters
): Promise<Record<string, AttributeValue>[]> {
  let allItems: Record<string, AttributeValue>[] = [];
  let lastEvaluatedKey = undefined;
  do {
    const query: ScanCommandInput = {
      TableName: getTableName(parameters),
      FilterExpression:
        'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
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
      TableName: getTableName(parameters),
      KeyConditionExpression: '#owner = :owner',
      ExpressionAttributeNames: {
        '#owner': 'owner',
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
  user: UserData,
  DRY_RUN: boolean = false
): Promise<void> {
  const tableName = getTableName(parameters);
  if (DRY_RUN) {
    console.log(
      `[DRY_RUN] Would update template id from ${item.id} to CLIENT#${user.clientId}`
    );
  } else {
    await client.send(
      new PutItemCommand({
        Item: {
          ...item,
          owner: { S: `CLIENT#${user.clientId}` },
          clientId: { S: user.clientId },
          createdBy: item.owner,
          updatedBy: item.owner,
        },
        TableName: tableName,
      })
    );
    console.log('Template data migrated');
  }
}

export async function deleteItem(
  item: Record<string, AttributeValue>,
  parameters: Parameters
) {
  const tableName = getTableName(parameters);
  await client.send(
    new DeleteItemCommand({
      Key: {
        id: item.id,
        owner: item.owner,
      },
      TableName: tableName,
    })
  );
  console.log('Item deleted');
}
