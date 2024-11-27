import {
  CreateTemplateInput,
  ErrorCase,
  failure,
  Result,
  success,
  TemplateStatus,
  UpdateTemplateInput,
} from 'nhs-notify-templates-client';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
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
): Promise<Result<Template>> => {
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

    return success(response.Item as Template);
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found', error);
    }

    return failure(ErrorCase.DATABASE_FAILURE, 'Failed to get template', error);
  }
};

const create = async (
  template: CreateTemplateInput,
  owner: string
): Promise<Result<Template>> => {
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
    await client.send(
      new PutCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Item: entity,
        ReturnValues: 'ALL_NEW',
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
  template: UpdateTemplateInput,
  owner: string
): Promise<Result<Template>> => {
  const input: UpdateCommandInput = {
    TableName: process.env.TEMPLATES_TABLE_NAME,
    Key: {
      id: template.id,
      owner,
    },
    UpdateExpression: `set ${[
      `name = :name`,
      'message = :message',
      'subject = :subject',
      'updatedAt = :updateAt',
      'status = :status',
    ].join(', ')}`,
    ExpressionAttributeValues: {
      ':name': template.name,
      ':message': template.message,
      ':subject': template.subject,
      ':status': template.status,
      ':updateAt': new Date().toISOString(),
      ':not_yet_submitted': TemplateStatus.NOT_YET_SUBMITTED,
    },
    ConditionExpression: 'status = :not_yet_submitted',
    ReturnValues: 'ALL_NEW',
  };

  try {
    const response = await client.send(new UpdateCommand(input));

    return success(response.Attributes as Template);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return failure(
        ErrorCase.TEMPLATE_ALREADY_SUBMITTED,
        'Can not update template due to status being NOT_YET_SUBMITTED',
        error
      );
    }

    if (error instanceof ResourceNotFoundException) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found', error);
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
