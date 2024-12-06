import {
  GetUserCommand,
  GetUserCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { mockDeep } from 'jest-mock-extended';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { getOwner } from '../../email/get-owner';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  class MockCognitoIdentityProvider {
    async send(command: GetUserCommand) {
      if (command.input.AccessToken === 'missing-user') {
        return {};
      }

      if (command.input.AccessToken === 'malformed-user') {
        return {
          Username: 'username',
          UserAttributes: [],
        };
      }

      return {
        Username: 'username',
        UserAttributes: [
          {
            Name: 'email',
            Value: 'recipient-email',
          },
        ],
      };
    }
  }

  class MockGetUserCommand {
    constructor(public readonly input: GetUserCommandInput) {} // eslint-disable-line no-empty-function
  }

  return {
    CognitoIdentityProviderClient: MockCognitoIdentityProvider,
    GetUserCommand: MockGetUserCommand,
  };
});

test('Error on missing access token', async () => {
  const promise = getOwner(
    mockDeep<APIGatewayProxyEvent>({
      headers: {
        Authorization: undefined,
      },
    })
  );

  await expect(promise).rejects.toThrow('Missing access token');
});

test('Error on missing user', async () => {
  const promise = getOwner(
    mockDeep<APIGatewayProxyEvent>({
      headers: {
        Authorization: 'missing-user',
      },
    })
  );

  await expect(promise).rejects.toThrow('Missing user');
});

test('Error on missing email address', async () => {
  const promise = getOwner(
    mockDeep<APIGatewayProxyEvent>({
      headers: {
        Authorization: 'malformed-user',
      },
    })
  );

  await expect(promise).rejects.toThrow('Missing user');
});

test('gets owner', async () => {
  const res = await getOwner(
    mockDeep<APIGatewayProxyEvent>({
      headers: {
        Authorization: 'auth-header',
      },
    })
  );

  expect(res).toEqual({
    username: 'username',
    emailAddress: 'recipient-email',
  });
});
