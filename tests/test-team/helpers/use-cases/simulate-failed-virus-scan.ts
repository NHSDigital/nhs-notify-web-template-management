import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { IUseCase } from './use-case-orchestrator';
import { Template } from '../types';

type Config = {
  templateId: string;
  templateOwner: string;
  path:
    | 'files.pdfTemplate.virusScanStatus'
    | 'files.testDataCsv.virusScanStatus';
};

export class SimulateFailedVirusScan implements IUseCase<Template> {
  readonly #ddbDocClient: DynamoDBDocumentClient;
  readonly #config: Config;

  constructor(config: Config) {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.#ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
    this.#config = config;
  }

  async execute() {
    const result = await this.#ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Key: {
          owner: this.#config.templateOwner,
          id: this.#config.templateId,
        },
        UpdateExpression: `SET ${this.#config.path} = :virusScanStatus`,
        ExpressionAttributeValues: {
          ':virusScanStatus': 'FAILED',
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as Template;
  }
}
