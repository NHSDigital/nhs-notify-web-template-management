import {
  EmailProperties,
  ErrorCase,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  TemplateStatus,
  UpdateTemplate,
  ValidatedCreateTemplate,
  ValidatedUpdateTemplate,
} from 'nhs-notify-backend-client';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
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

const nhsAppAttributes: Record<keyof NhsAppProperties, null> = {
  message: null,
};

const emailAttributes: Record<keyof EmailProperties, null> = {
  message: null,
  subject: null,
};

const smsAttributes: Record<keyof SmsProperties, null> = {
  message: null,
};

const letterAttributes: Record<keyof LetterProperties, null> = {
  letterType: null,
  language: null,
  files: null,
};

export class TemplateRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string,
    private readonly generateId: () => string
  ) {}

  async get(
    templateId: string,
    owner: string
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    try {
      const response = await this.client.send(
        new GetCommand({
          TableName: this.templatesTableName,
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
      return failure(ErrorCase.IO_FAILURE, 'Failed to get template', error);
    }
  }

  async create(
    template: ValidatedCreateTemplate,
    owner: string,
    initialStatus: TemplateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const date = new Date().toISOString();
    const entity: DatabaseTemplate = {
      ...template,
      id: this.generateId(),
      owner,
      version: 1,
      templateStatus: initialStatus,
      createdAt: date,
      updatedAt: date,
    };

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.templatesTableName,
          Item: entity,
        })
      );

      return success(entity);
    } catch (error) {
      return failure(ErrorCase.IO_FAILURE, 'Failed to create template', error);
    }
  }

  async update(
    templateId: string,
    template: ValidatedUpdateTemplate,
    owner: string,
    expectedStatus: TemplateStatus
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const updateExpression = [
      '#name = :name',
      '#updatedAt = :updateAt',
      '#templateStatus = :templateStatus',
      ...this.getChannelAttributeExpressions(template),
    ];

    let expressionAttributeNames: Record<string, string> = {
      '#name': 'name',
      '#templateStatus': 'templateStatus',
      '#updatedAt': 'updatedAt',
      '#templateType': 'templateType',
      ...this.getChannelAttributeNames(template),
    };

    let expressionAttributeValues: Record<string, string | number> = {
      ':name': template.name,
      ':templateStatus': template.templateStatus,
      ':updateAt': new Date().toISOString(),
      ':expectedStatus': expectedStatus,
      ':templateType': template.templateType,
      ...this.getChannelAttributeValues(template),
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
      TableName: this.templatesTableName,
      Key: {
        id: templateId,
        owner,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression:
        'attribute_exists(id) AND #templateStatus = :expectedStatus AND #templateType = :templateType',
      ReturnValues: 'ALL_NEW',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    };

    try {
      const response = await this.client.send(new UpdateCommand(input));

      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
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

      return failure(ErrorCase.IO_FAILURE, 'Failed to update template', error);
    }
  }

  async list(owner: string): Promise<ApplicationResult<DatabaseTemplate[]>> {
    try {
      const input: QueryCommandInput = {
        TableName: this.templatesTableName,
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
        const { Items = [], LastEvaluatedKey } = await this.client.send(
          new QueryCommand(input)
        );

        input.ExclusiveStartKey = LastEvaluatedKey;

        items.push(...(Items as DatabaseTemplate[]));
      } while (input.ExclusiveStartKey);

      return success(items);
    } catch (error) {
      return failure(ErrorCase.IO_FAILURE, 'Failed to list templates', error);
    }
  }

  private attributeExpressionsFromMap<T>(
    channelSpecificAttributes: Record<keyof T, null>
  ) {
    return Object.keys(channelSpecificAttributes).map(
      (att) => `#${att} = :${att}`
    );
  }

  private getChannelAttributeExpressions(template: UpdateTemplate) {
    const expressions = [];
    if (template.templateType === 'NHS_APP') {
      expressions.push(
        this.attributeExpressionsFromMap<NhsAppProperties>(nhsAppAttributes)
      );
    }
    if (template.templateType === 'EMAIL') {
      expressions.push(
        this.attributeExpressionsFromMap<EmailProperties>(emailAttributes)
      );
    }
    if (template.templateType === 'SMS') {
      expressions.push(
        this.attributeExpressionsFromMap<SmsProperties>(smsAttributes)
      );
    }
    if (template.templateType === 'LETTER') {
      expressions.push(
        this.attributeExpressionsFromMap<LetterProperties>(letterAttributes)
      );
    }
    return expressions;
  }

  private attributeNamesFromMap<T>(
    channelSpecificAttributes: Record<keyof T, null>
  ) {
    let attributeNames = {};

    for (const att in channelSpecificAttributes) {
      attributeNames = {
        ...attributeNames,
        [`#${att}`]: att,
      };
    }

    return attributeNames;
  }

  private getChannelAttributeNames(template: UpdateTemplate) {
    let names = {};

    if (template.templateType === 'NHS_APP') {
      names = this.attributeNamesFromMap<NhsAppProperties>(nhsAppAttributes);
    }
    if (template.templateType === 'EMAIL') {
      names = this.attributeNamesFromMap<EmailProperties>(emailAttributes);
    }
    if (template.templateType === 'SMS') {
      names = this.attributeNamesFromMap<SmsProperties>(smsAttributes);
    }
    if (template.templateType === 'LETTER') {
      names = this.attributeNamesFromMap<LetterProperties>(letterAttributes);
    }

    return names;
  }

  private attributeValuesFromMapAndTemplate<T>(
    channelSpecificAttributes: Record<keyof T, null>,
    template: T
  ) {
    let attributeValues = {};

    for (const att in channelSpecificAttributes) {
      attributeValues = {
        ...attributeValues,
        [`:${att}`]: template[att],
      };
    }

    return attributeValues;
  }

  private getChannelAttributeValues(template: ValidatedUpdateTemplate) {
    let values = {};

    if (template.templateType === 'NHS_APP') {
      values = this.attributeValuesFromMapAndTemplate<NhsAppProperties>(
        nhsAppAttributes,
        template
      );
    }
    if (template.templateType === 'EMAIL') {
      values = this.attributeValuesFromMapAndTemplate<EmailProperties>(
        emailAttributes,
        template
      );
    }
    if (template.templateType === 'SMS') {
      values = this.attributeValuesFromMapAndTemplate<SmsProperties>(
        smsAttributes,
        template
      );
    }
    if (template.templateType === 'LETTER') {
      values = this.attributeValuesFromMapAndTemplate<LetterProperties>(
        letterAttributes,
        template
      );
    }

    return values;
  }
}
