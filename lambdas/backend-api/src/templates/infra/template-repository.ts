import { randomUUID as uuidv4 } from 'node:crypto';
import {
  CreateTemplate,
  EmailProperties,
  ErrorCase,
  LetterProperties,
  NHSAppProperties,
  SMSProperties,
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

    if (item.templateStatus === 'DELETED') {
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
    templateStatus: 'NOT_YET_SUBMITTED',
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

const nhsAppAttributes: Record<keyof NHSAppProperties, null> = {
  templateType: null,
  message: null,
};

const emailAttributes: Record<keyof EmailProperties, null> = {
  templateType: null,
  message: null,
  subject: null,
};

const smsAttributes: Record<keyof SMSProperties, null> = {
  templateType: null,
  message: null,
};

const letterAttributes: Record<keyof LetterProperties, null> = {
  templateType: null,
  letterType: null,
  language: null,
  files: null,
};

const attributeExpressionsFromMap = <T>(
  channelSpecificAttributes: Record<keyof T, null>
) => Object.keys(channelSpecificAttributes).map((att) => `#${att} = :${att}`);

const getChannelAttributeExpressions = (template: UpdateTemplate) => {
  const expressions = [];
  if (template.templateType === 'NHS_APP') {
    expressions.push(
      attributeExpressionsFromMap<NHSAppProperties>(nhsAppAttributes)
    );
  }
  if (template.templateType === 'EMAIL') {
    expressions.push(
      attributeExpressionsFromMap<EmailProperties>(emailAttributes)
    );
  }
  if (template.templateType === 'SMS') {
    expressions.push(attributeExpressionsFromMap<SMSProperties>(smsAttributes));
  }
  if (template.templateType === 'LETTER') {
    expressions.push(
      attributeExpressionsFromMap<LetterProperties>(letterAttributes)
    );
  }
  return expressions;
};

const attributeNamesFromMap = <T>(
  channelSpecificAttributes: Record<keyof T, null>
) => {
  let attributeNames = {};

  for (const att in channelSpecificAttributes) {
    attributeNames = {
      ...attributeNames,
      [`#${att}`]: att,
    };
  }

  return attributeNames;
};

const getChannelAttributeNames = (template: UpdateTemplate) => {
  let names = {};

  if (template.templateType === 'NHS_APP') {
    names = attributeNamesFromMap<NHSAppProperties>(nhsAppAttributes);
  }
  if (template.templateType === 'EMAIL') {
    names = attributeNamesFromMap<EmailProperties>(emailAttributes);
  }
  if (template.templateType === 'SMS') {
    names = attributeNamesFromMap<SMSProperties>(smsAttributes);
  }
  if (template.templateType === 'LETTER') {
    names = attributeNamesFromMap<LetterProperties>(letterAttributes);
  }

  return names;
};

const attributeValuesFromMapAndTemplate = <T>(
  channelSpecificAttributes: Record<keyof T, null>,
  template: T
) => {
  let attributeValues = {};

  for (const att in channelSpecificAttributes) {
    attributeValues = {
      ...attributeValues,
      [`:${att}`]: template[att],
    };
  }

  return attributeValues;
};

const getChannelAttributeValues = (template: UpdateTemplate) => {
  let values = {};

  if (template.templateType === 'NHS_APP') {
    values = attributeValuesFromMapAndTemplate<NHSAppProperties>(
      nhsAppAttributes,
      template
    );
  }
  if (template.templateType === 'EMAIL') {
    values = attributeValuesFromMapAndTemplate<EmailProperties>(
      emailAttributes,
      template
    );
  }
  if (template.templateType === 'SMS') {
    values = attributeValuesFromMapAndTemplate<SMSProperties>(
      smsAttributes,
      template
    );
  }
  if (template.templateType === 'LETTER') {
    values = attributeValuesFromMapAndTemplate<LetterProperties>(
      letterAttributes,
      template
    );
  }

  return values;
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
    ...getChannelAttributeExpressions(template),
  ];

  let expressionAttributeNames: Record<string, string> = {
    '#name': 'name',
    '#templateStatus': 'templateStatus',
    '#updatedAt': 'updatedAt',
    ...getChannelAttributeNames(template),
  };

  let expressionAttributeValues: Record<string, string | number> = {
    ':name': template.name,
    ':templateStatus': template.templateStatus,
    ':updateAt': new Date().toISOString(),
    ':not_yet_submitted': 'NOT_YET_SUBMITTED',
    ':templateType': template.templateType,
    ...getChannelAttributeValues(template),
  };

  if (template.templateStatus === 'DELETED') {
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
        error.Item.templateStatus.S === 'DELETED'
      ) {
        return failure(
          ErrorCase.TEMPLATE_NOT_FOUND,
          `Template not found`,
          error
        );
      }

      if (error.Item.templateStatus.S !== 'NOT_YET_SUBMITTED') {
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
        ':deletedStatus': 'DELETED',
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
