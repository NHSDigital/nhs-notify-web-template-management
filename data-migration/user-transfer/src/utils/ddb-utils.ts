import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { Parameters } from '@/src/user-transfer';

const client = new DynamoDBClient({ region: 'eu-west-2' });

function getTableName(environment: string) {
  return `nhs-notify-${environment}-app-api-templates`;
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
        ':owner': { S: parameters.sourceOwner },
      },
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const queryResult = await client.send(new QueryCommand(query));
    lastEvaluatedKey = queryResult.LastEvaluatedKey;
    allItems = [...allItems, ...(queryResult.Items || [])];
  } while (lastEvaluatedKey);
  return allItems;
}

export async function updateItem(
  item: Record<string, AttributeValue>,
  parameters: Parameters
): Promise<void> {
  const tableName = getTableName(parameters.environment);
  await client.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            Item: {
              ...item,
              owner: { S: parameters.destinationOwner },
              updatedAt: { S: new Date().toISOString() },
            },
            TableName: tableName,
          },
        },
        {
          Delete: {
            Key: {
              owner: item.owner,
              id: item.id,
            },
            TableName: tableName,
          },
        },
      ],
    })
  );
}
