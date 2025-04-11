import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateRepository } from '../../infra/template-repository';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';

const templatesTableName = 'nhs-notify-main-app-api-templates';
const owner = 'f6109f07-c31e-4b9a-b8eb-110d712b8342';
const templateId = '6b5a8b45-c4b0-4f32-aeca-9083406aa07f';

function setup() {
  const client = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateRepository(
    client as unknown as DynamoDBDocumentClient,
    templatesTableName
  );

  return { templateRepository, mocks: { client } };
}

describe('TemplateRepository', () => {
  test('send command to update to NOT_YET_SUBMITTED', async () => {
    const { mocks, templateRepository } = setup();

    await templateRepository.updateToNotYetSubmitted(owner, templateId);

    expect(mocks.client).toHaveReceivedCommandWith(UpdateCommand, {
      ExpressionAttributeNames: { '#templateStatus': 'templateStatus' },
      ExpressionAttributeValues: { ':templateStatus': 'NOT_YET_SUBMITTED' },
      Key: {
        id: templateId,
        owner,
      },
      TableName: templatesTableName,
      UpdateExpression: 'SET #templateStatus = :templateStatus',
    });
  });
});
