import { randomUUID as uuidv4 } from 'node:crypto';
import {
  CreateTemplate,
  ErrorCase,
  TemplateStatus,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ApplicationResult, failure, success, calculateTTL } from '../../utils';
import { DatabaseTemplate } from './template';

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const get = async (
  templateId: string,
  owner: string
): Promise<ApplicationResult<DatabaseTemplate>> => {
  try {
    const response = await client.send(
      new GetCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Key: {
          id: templateId,
          owner,
        },
      })
    );

    if (!response?.Item) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found');
    }

    const item = response.Item as DatabaseTemplate;

    if (item.templateStatus === TemplateStatus.DELETED) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found');
    }

    return success(item);
  } catch (error) {
    return failure(ErrorCase.DATABASE_FAILURE, 'Failed to get template', error);
  }
};

const create = async (
  template: CreateTemplate,
  owner: string
): Promise<ApplicationResult<DatabaseTemplate>> => {
  const date = new Date().toISOString();
  const entity: DatabaseTemplate = {
    ...template,
    id: uuidv4(),
    owner,
    version: 1,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    createdAt: date,
    updatedAt: date,
  };

  try {
    await client.send(
      new PutCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Item: entity,
      })
    );

    return success(entity);
  } catch (error) {
    return failure(
      ErrorCase.DATABASE_FAILURE,
      'Failed to create template',
      error
    );
  }
};

const update = async (
  templateId: string,
  template: UpdateTemplate,
  owner: string
): Promise<ApplicationResult<DatabaseTemplate>> => {
  const updateExpression = [
    '#name = :name',
    '#updatedAt = :updateAt',
    '#templateStatus = :templateStatus',
  ];

  let expressionAttributeNames: Record<string, string> = {
    '#name': 'name',
    '#templateStatus': 'templateStatus',
    '#updatedAt': 'updatedAt',
    '#templateType': 'templateType',
  };

  let expressionAttributeValues: Record<string, string | number> = {
    ':name': template.name,
    ':templateStatus': template.templateStatus,
    ':updateAt': new Date().toISOString(),
    ':not_yet_submitted': TemplateStatus.NOT_YET_SUBMITTED,
    ':templateType': template.templateType,
  };

  if (template.message) {
    updateExpression.push('#message = :message');
    expressionAttributeNames = {
      ...expressionAttributeNames,
      '#message': 'message',
    };
    expressionAttributeValues = {
      ...expressionAttributeValues,
      ':message': template.message,
    };
  }

  if (template.subject) {
    updateExpression.push('#subject = :subject');
    expressionAttributeNames = {
      ...expressionAttributeNames,
      '#subject': 'subject',
    };
    expressionAttributeValues = {
      ...expressionAttributeValues,
      ':subject': template.subject,
    };
  }

  if (template.templateStatus === TemplateStatus.DELETED) {
    updateExpression.push('#ttl = :ttl');
    expressionAttributeNames = {
      ...expressionAttributeNames,
      '#ttl': 'ttl',
    };
    expressionAttributeValues = {
      ...expressionAttributeValues,
      ':ttl': calculateTTL(),
    };
  }

  const input: UpdateCommandInput = {
    TableName: process.env.TEMPLATES_TABLE_NAME,
    Key: {
      id: templateId,
      owner,
    },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression:
      'attribute_exists(id) AND #templateStatus = :not_yet_submitted AND #templateType = :templateType',
    ReturnValues: 'ALL_NEW',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  };

  try {
    const response = await client.send(new UpdateCommand(input));

    return success(response.Attributes as DatabaseTemplate);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      if (
        !error.Item ||
        error.Item.templateStatus.S === TemplateStatus.DELETED
      ) {
        return failure(
          ErrorCase.TEMPLATE_NOT_FOUND,
          `Template not found`,
          error
        );
      }

      if (error.Item.templateStatus.S !== TemplateStatus.NOT_YET_SUBMITTED) {
        return failure(
          ErrorCase.TEMPLATE_ALREADY_SUBMITTED,
          `Template with status ${error.Item.templateStatus.S} cannot be updated`,
          error
        );
      }

      if (error.Item.templateType.S !== template.templateType) {
        return failure(
          ErrorCase.CANNOT_CHANGE_TEMPLATE_TYPE,
          'Can not change template templateType',
          error,
          {
            templateType: `Expected ${error.Item.templateType.S} but got ${template.templateType}`,
          }
        );
      }
    }

    return failure(
      ErrorCase.DATABASE_FAILURE,
      'Failed to update template',
      error
    );
  }
};

const list = async (
  owner: string
): Promise<ApplicationResult<DatabaseTemplate[]>> => {
  try {
    const input: QueryCommandInput = {
      TableName: process.env.TEMPLATES_TABLE_NAME,
      KeyConditionExpression: '#owner = :owner',
      ExpressionAttributeNames: {
        '#owner': 'owner',
        '#status': 'templateStatus',
      },
      ExpressionAttributeValues: {
        ':owner': owner,
        ':deletedStatus': TemplateStatus.DELETED,
      },
      FilterExpression: '#status <> :deletedStatus',
    };

    const items: DatabaseTemplate[] = [];

    do {
      // eslint-disable-next-line no-await-in-loop
      const { Items = [], LastEvaluatedKey } = await client.send(
        new QueryCommand(input)
      );

      input.ExclusiveStartKey = LastEvaluatedKey;

      items.push(...(Items as DatabaseTemplate[]));
    } while (input.ExclusiveStartKey);

    return success(items);
  } catch (error) {
    return failure(
      ErrorCase.DATABASE_FAILURE,
      'Failed to list templates',
      error
    );
  }
};
export const templateRepository = {
  get,
  create,
  update,
  list,
};
