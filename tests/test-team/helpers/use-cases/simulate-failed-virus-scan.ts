import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { IUseCase } from './use-case-orchestrator';
import { Template } from '../types';

type Config = {
  templateId: string;
  clientId: string;
  filePath:
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
          owner: `CLIENT#${this.#config.clientId}`,
          id: this.#config.templateId,
        },
        UpdateExpression: `ADD #lockNumber :lockNumberIncrement SET ${this.#config.filePath} = :virusScanStatus, templateStatus = :virusScanStatusFailedTemplateStatus`,
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':lockNumberIncrement': 1,
          ':virusScanStatus': 'FAILED',
          ':virusScanStatusFailedTemplateStatus': 'VIRUS_SCAN_FAILED',
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as Template;
  }
}
