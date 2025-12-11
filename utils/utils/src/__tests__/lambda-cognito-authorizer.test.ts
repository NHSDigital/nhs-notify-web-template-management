import { sign } from 'jsonwebtoken';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import { LambdaCognitoAuthorizer } from '../lambda-cognito-authorizer';

const userPoolId = 'user-pool-id';
const userPoolClientId = 'user-pool-client-id';

const mockLogger = createMockLogger();

class MockCognitoIdentityProvider extends CognitoIdentityProviderClient {
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
        UserAttributes: [{ Name: 'sub', Value: 'sub' }],
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
        UserAttributes: [{ Name: 'NOT-SUB', Value: 'not-sub' }],
      };
    }

    return {
      Username: 'username',
      UserAttributes: [{ Name: 'sub', Value: 'sub' }],
    };
  }
}

jest.mock('jwks-rsa', () => {
  const getPublicKey = () => 'key';

  const getSigningKey = () => ({
    getPublicKey,
  });

  const jwksClient = { getSigningKey };

  return () => jwksClient;
});

const authorizer = new LambdaCognitoAuthorizer(
  new MockCognitoIdentityProvider(),
  mockLogger.logger
);

beforeEach(() => {
  jest.resetAllMocks();
  mockLogger.reset();
});

describe('LambdaCognitoAuthorizer', () => {
  test('returns success on valid token', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({
      success: true,
      internalUserId: 'internal-user-id',
      clientId: 'nhs-notify-client-id',
    });
    expect(mockLogger.logMessages).toEqual([]);
  });

  test('returns success on valid token when expected resource owner is specified', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(
      userPoolId,
      userPoolClientId,
      jwt,
      'nhs-notify-client-id'
    );

    expect(res).toEqual({
      success: true,
      internalUserId: 'internal-user-id',
      clientId: 'nhs-notify-client-id',
    });
    expect(mockLogger.logMessages).toEqual([]);
  });

  test('returns failure on malformed token', async () => {
    const res = await authorizer.authorize(
      userPoolId,
      userPoolClientId,
      'lemon'
    );

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message:
          'Failed to authorize: Invalid token specified: invalid base64 for part #1 (base64 string is not of the correct length)',
      })
    );
  });

  test('returns failure on token with missing kid', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key'
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Authorization token missing kid',
      })
    );
  });

  test('returns failure on token with incorrect cognito client_id claim', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id-2',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message:
          'Token has invalid Cognito client ID, expected user-pool-client-id but received user-pool-client-id-2',
      })
    );
  });

  test('returns failure on token with incorrect iss claim', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-2',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message:
          'Failed to authorize: jwt issuer invalid. expected: https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
      })
    );
  });

  test('returns failure on token with incorrect token_use claim', async () => {
    const jwt = sign(
      {
        token_use: 'id',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Token has invalid token_use, expected access but received id',
      })
    );
  });

  test('returns failure when no NHS Notify client ID is present in the access token', async () => {
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

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('Failed to authorize'),
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['nhs-notify:client-id'],
            message: 'Invalid input: expected string, received undefined',
          }),
        ]),
      })
    );
  });

  test('returns failure when NHS Notify client ID claim is empty string', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': '',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('Failed to authorize'),
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['nhs-notify:client-id'],
            message: 'Too small: expected string to have >=1 characters',
          }),
        ]),
      })
    );
  });

  test('returns failure when NHS Notify client ID claim is whitespace', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': '    ',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: expect.stringContaining('Failed to authorize'),
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['nhs-notify:client-id'],
            message: 'Too small: expected string to have >=1 characters',
          }),
        ]),
      })
    );
  });

  test('returns failure on Cognito not validating the token', async () => {
    const cognitoErrorUserPool = 'user-pool-id-cognito-error';

    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id-cognito-error',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(
      cognitoErrorUserPool,
      userPoolClientId,
      jwt
    );

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: 'Failed to authorize: Cognito error',
      })
    );
  });

  test.each([
    'user-pool-id-cognito-no-username',
    'user-pool-id-cognito-no-userattributes',
  ])('returns failure, when no Username on Cognito %p', async (iss) => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: `https://cognito-idp.eu-west-2.amazonaws.com/${iss}`,
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(iss, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'Missing user',
      })
    );
  });

  test('returns failure when expected resource owner does not match notify client id from Cognito', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(
      userPoolId,
      userPoolClientId,
      jwt,
      'expected'
    );

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'warn',
        message: 'clientId does not match expected resource owner',
      })
    );
  });

  test('returns Deny policy on expired token', async () => {
    const jwt = sign(
      {
        token_use: 'access',
        client_id: 'user-pool-client-id',
        iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
        exp: 1_640_995_200,
        'nhs-notify:client-id': 'nhs-notify-client-id',
        'nhs-notify:internal-user-id': 'internal-user-id',
      },
      'key',
      {
        keyid: 'key-id',
      }
    );

    const res = await authorizer.authorize(userPoolId, userPoolClientId, jwt);

    expect(res).toEqual({ success: false });
    expect(mockLogger.logMessages).toContainEqual(
      expect.objectContaining({
        level: 'error',
        message: 'Failed to authorize: jwt expired',
      })
    );
  });
});
