import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { IUseCase } from './use-case-orchestrator';
import { Template } from '../types';

type Config = {
  templateId: string;
  clientId: string;
  hasTestData: boolean;
};

export class SimulatePassedValidation implements IUseCase<Template> {
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
        UpdateExpression: `ADD #lockNumber :lockNumberIncrement ${[
          'SET files.pdfTemplate.virusScanStatus = :virusScanStatus',
          'templateStatus = :readyForSubmissionStatus',
          'files.proofs = :proofs',
          ...(this.#config.hasTestData
            ? ['files.testDataCsv.virusScanStatus = :virusScanStatus']
            : []),
        ].join(', ')}`,
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':lockNumberIncrement': 1,
          ':virusScanStatus': 'PASSED',
          ':readyForSubmissionStatus': 'PROOF_AVAILABLE',
          ':proofs': {
            proof: {
              fileName: 'proof.pdf',
              supplier: 'WTMMOCK',
              virusScanStatus: 'PASSED',
            },
          },
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as Template;
  }
}
