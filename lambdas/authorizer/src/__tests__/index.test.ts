/* eslint-disable max-classes-per-file */

import type { APIGatewayRequestAuthorizerEvent, Context } from 'aws-lambda';
import { sign } from 'jsonwebtoken';
import { mock } from 'jest-mock-extended';
import {
  GetUserCommand,
  GetUserCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { handler } from '../index';

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

      if (
        decodedJwt.iss ===
        'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-username'
      ) {
        return {
          Username: undefined,
          UserAttributes: [
            { Name: 'sub', Value: 'sub' },
            { Name: 'email', Value: 'test@email.com' },
          ],
        };
      }

      if (
        decodedJwt.iss ===
        'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-email'
      ) {
        return {
          Username: 'username',
          UserAttributes: [
            { Name: 'sub', Value: 'sub' },
            { Name: 'not-email', Value: 'test@email.com' },
          ],
        };
      }

      if (
        decodedJwt.iss ===
        'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-userattributes'
      ) {
        return {
          Username: 'username',
          UserAttributes: undefined,
        };
      }

      if (
        decodedJwt.iss ===
        'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-sub'
      ) {
        return {
          Username: 'username',
          UserAttributes: [
            { Name: 'NOT-SUB', Value: 'not-sub' },
            { Name: 'email', Value: 'test@email.com' },
          ],
        };
      }

      return {
        Username: 'username',
        UserAttributes: [
          { Name: 'sub', Value: 'sub' },
          { Name: 'email', Value: 'test@email.com' },
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
    user: 'sub',
    email: 'test@email.com',
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

const originalEnv = { ...process.env };

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

test.each([
  'user-pool-id-cognito-no-username',
  'user-pool-id-cognito-no-userattributes',
])('returns Deny policy, when no Username on Cognito %p', async (iss) => {
  process.env.USER_POOL_ID = iss;

  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: `https://cognito-idp.eu-west-2.amazonaws.com/${iss}`,
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
  expect(warnMock).toHaveBeenCalledWith('Missing user');
});

test('returns Deny policy, when no sub on Cognito UserAttributes', async () => {
  process.env.USER_POOL_ID = 'user-pool-id-cognito-no-sub';

  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-sub',
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
  expect(warnMock).toHaveBeenCalledWith('Missing user subject');
});

test('returns Allow policy, when no email on Cognito UserAttributes', async () => {
  process.env.USER_POOL_ID = 'user-pool-id-cognito-no-email';

  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-no-email',
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

  expect(res).toEqual({
    ...allowPolicy,
    context: {
      user: 'sub',
      email: undefined,
    },
  });
  expect(warnMock).toHaveBeenCalledWith('Missing user email address');
});

test('returns Allow policy on valid token', async () => {
  const jwt = sign(
    {
      token_use: 'access',
      client_id: 'user-pool-client-id',
      iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
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
