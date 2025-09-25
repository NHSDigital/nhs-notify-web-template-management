import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { Parameters, Template } from '@/src/utils/constants';
import { UserData } from './cognito-utils';
import { print } from './log';

const client = new DynamoDBClient({ region: 'eu-west-2' });

function getTableName(parameters: { environment: string; component: string }) {
  const { environment, component } = parameters;
  return `nhs-notify-${environment}-${component}-api-templates`;
}

export async function retrieveAllTemplatesV2(
  tableName: string
): Promise<Template[]> {
  let allItems: Record<string, AttributeValue>[] = [];

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
    lastEvaluatedKey = queryResult.LastEvaluatedKey;
    allItems = [...allItems, ...(queryResult.Items ?? [])];
  } while (lastEvaluatedKey);

  return allItems.map((item) => ({
    id: item.id.S!,
    owner: item.owner.S!,
  }));
}

export async function retrieveAllTemplates(params: {
  environment: string;
  component: string;
}): Promise<Record<string, AttributeValue>[]> {
  let allItems: Record<string, AttributeValue>[] = [];
  let lastEvaluatedKey = undefined;
  do {
    const query: ScanCommandInput = {
      TableName: getTableName(params),
      FilterExpression:
        'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
      ExpressionAttributeNames: { '#owner': 'owner' },
      ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
      ExclusiveStartKey: lastEvaluatedKey,
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

async function getTemplate(
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

export async function migrateOwnership(
  tableName: string,
  templateId: string,
  from: string,
  to: string,
  dryRun = true
) {
  const template = await getTemplate(tableName, from, templateId);

  if (!template) {
    throw new Error(`No template found for ${templateId}`);
  }

  if (dryRun) {
    print(
      `[DRY RUN] DynamoDB: template ${template.id.S} found and will transferred from ${from} to CLIENT#${to}`
    );
    print(
      `[DRY RUN] DynamoDB: template ${template.id.S} with owner ${from} will be deleted`
    );
  } else {
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

    return client.send(cmd);
  }
}
