import {
  CreateTemplate,
  ErrorCase,
  TemplateStatus,
  TemplateType,
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
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import { Template } from './template';

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' }),
  {
    marshallOptions: { removeUndefinedValues: true },
  }
);

const get = async (
  templateId: string,
  owner: string
): Promise<ApplicationResult<Template>> => {
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

    return success(response?.Item as Template);
  } catch (error) {
    return failure(ErrorCase.DATABASE_FAILURE, 'Failed to get template', error);
  }
};

const create = async (
  template: CreateTemplate,
  owner: string
): Promise<ApplicationResult<Template>> => {
  const entity: Template = {
    ...template,
    id: uuidv4(),
    owner,
    version: 1,
    status: TemplateStatus.NOT_YET_SUBMITTED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await client.send(
      new PutCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Item: entity,
        ReturnConsumedCapacity: 'TOTAL',
      })
    );

    const consumedUnits = response?.ConsumedCapacity?.CapacityUnits || 0;

    // Note: This is a bit strange, PutCommand does not return the any data when creating
    // a new item. So we can only infer the success by checking the WriteCapacityUnits
    // Or do a GetItem - which is expensive.
    if (consumedUnits === 0) {
      throw new Error('Expected DynamoDB CapacityUnits to be greater than 0', {
        cause: response,
      });
    }

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
): Promise<ApplicationResult<Template>> => {
  const updateExpression = [
    '#name = :name',
    '#message = :message',
    '#updatedAt = :updateAt',
    '#status = :status',
  ];

  let expressionAttributeNames: Record<string, string> = {
    '#name': 'name',
    '#message': 'message',
    '#status': 'status',
    '#updatedAt': 'updatedAt',
  };

  let expressionAttributeValues: Record<string, string> = {
    ':name': template.name,
    ':message': template.message,
    ':status': template.status,
    ':updateAt': new Date().toISOString(),
    ':not_yet_submitted': TemplateStatus.NOT_YET_SUBMITTED,
  };

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
      'attribute_exists(id) AND #status = :not_yet_submitted AND #type = :type',
    ReturnValues: 'ALL_NEW',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  };

  try {
    const response = await client.send(new UpdateCommand(input));

    return success(response.Attributes as Template);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      if (!error.Item) {
        return failure(
          ErrorCase.TEMPLATE_NOT_FOUND,
          `Template not found`,
          error
        );
      }

      if (error.Item.status.S !== TemplateStatus.NOT_YET_SUBMITTED) {
        return failure(
          ErrorCase.TEMPLATE_ALREADY_SUBMITTED,
          `Can not update template due to status being ${error.Item.status}`,
          error
        );
      }

      if (error.Item.type.S !== template.type) {
        return failure(
          ErrorCase.CANNOT_CHANGE_TEMPLATE_TYPE,
          `Can not change template type. Expected ${error.Item.type.S} but got ${template.type} `,
          error
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

export const templateRepository = {
  get,
  create,
  update,
};
