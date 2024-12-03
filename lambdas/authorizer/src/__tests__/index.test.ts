/* eslint-disable max-classes-per-file */

import type { APIGatewayRequestAuthorizerEvent, Context } from 'aws-lambda';
import { sign } from 'jsonwebtoken';
import { mock } from 'jest-mock-extended';
import {
  GetUserCommand,
  GetUserCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { handler } from '../index';
import { logger } from '../logger';

const methodArn =
  'arn:aws:execute-api:eu-west-2:000000000000:api-id/stage/GET/v1/example-endpoint';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  class MockCognitoIdentityProvider {
    async send(command: GetUserCommand) {
      const decodedJwt = jwtDecode(command.input.AccessToken ?? '');

      if (
        decodedJwt.iss ===
        'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-error'
      ) {
        throw new Error('Cognito error');
      }

      return {};
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
const warnMock = jest.spyOn(logger, 'warn');
const errorMock = jest.spyOn(logger, 'error');

jest.mock('jwks-rsa', () => {
  const getPublicKey = () => 'key';

  const getSigningKey = () => ({
    getPublicKey,
  });

  const jwksClient = { getSigningKey };

  return () => jwksClient;
});

const allowPolicy = {
  principalId: 'api-caller',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: methodArn,
      },
    ],
  },
  context: {
    username: 'username',
  },
};

const denyPolicy = {
  principalId: 'api-caller',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Deny',
        Resource: methodArn,
      },
    ],
  },
};

const originalEnv = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env.USER_POOL_ID = 'user-pool-id';
  process.env.USER_POOL_CLIENT_ID = 'user-pool-client-id';
});

afterEach(() => {
  process.env = originalEnv;
});

test('returns Deny policy on lambda misconfiguration', async () => {
  process.env.USER_POOL_ID = '';

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: '123' },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(errorMock).toHaveBeenCalledWith('Lambda misconfiguration');
});

test('returns Deny policy if no Authorization token in header', async () => {
  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: undefined },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
});

test('returns Deny policy on malformed token', async () => {
  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: 'lemon' },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(errorMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message:
        'Invalid token specified: invalid base64 for part #1 (base64 string is not of the correct length)',
    })
  );
});

test('returns Deny policy on token with missing kid', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
    },
    'key'
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(warnMock).toHaveBeenCalledWith('Authorization token missing kid');
});

test('returns Deny policy on token with incorrect client_id claim', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id-2',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(warnMock).toHaveBeenCalledWith(
    'Token has invalid client ID, expected user-pool-client-id but received user-pool-client-id-2'
  );
});

test('returns Deny policy on token with incorrect iss claim', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-2',
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(errorMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message:
        'jwt issuer invalid. expected: https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
    })
  );
});

test('returns Deny policy on token with incorrect token_use claim', async () => {
  const jwt = sign(
    {
      token_use: 'id',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(warnMock).toHaveBeenCalledWith(
    'Token has invalid token_use, expected access but received id'
  );
});

test('returns Deny policy on Cognito not validating the token', async () => {
  process.env.USER_POOL_ID = 'user-pool-id-cognito-error';

  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-error',
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(errorMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'Cognito error',
    })
  );
});

test('returns Allow policy on valid token', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(allowPolicy);
  expect(warnMock).not.toHaveBeenCalled();
  expect(errorMock).not.toHaveBeenCalled();
});

test('returns Deny policy on expired token', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
      exp: 1_640_995_200,
      username: 'username',
    },
    'key',
    {
      keyid: 'key-id',
    }
  );

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      methodArn,
      headers: { Authorization: jwt },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(errorMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'jwt expired',
    })
  );
});
