import { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { getTemplate } from '../../email/get-template';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  class MockDynamoDBDocumentClient {
    static from(_: unknown) {
      return new MockDynamoDBDocumentClient();
    }

    async send(command: GetCommand) {
      if (command.input.Key?.id === 'empty-template') {
        return {};
      }

      return {
        Item: {
          owner: 'owner',
          id: 'id',
          name: 'name',
          message: 'message',
        },
      };
    }
  }

  class MockGetCommand {
    constructor(public readonly input: GetCommandInput) {} // eslint-disable-line no-empty-function
  }

  return {
    DynamoDBDocumentClient: MockDynamoDBDocumentClient,
    GetCommand: MockGetCommand,
  };
});

test('missing item', async () => {
  const promise = getTemplate('table-name', 'owner', 'empty-template');

  await expect(promise).rejects.toThrow('Invalid template ID');
});

test('gets template', async () => {
  const res = await getTemplate('table-name', 'owner', 'template-id');

  expect(res).toEqual({
    owner: 'owner',
    id: 'id',
    name: 'name',
    message: 'message',
  });
});
