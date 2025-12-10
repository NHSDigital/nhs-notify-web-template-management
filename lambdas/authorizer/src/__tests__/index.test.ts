import type { APIGatewayRequestAuthorizerEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { handler } from '../index';
import { LambdaCognitoAuthorizer } from 'nhs-notify-web-template-management-utils/lambda-cognito-authorizer';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const requestContext = {
  accountId: '000000000000',
  apiId: 'api-id',
  stage: 'stage',
};

const methodArn = 'arn:aws:execute-api:eu-west-2:000000000000:api-id/stage/*';

jest.mock('nhs-notify-web-template-management-utils/logger');
const mockLogger = jest.mocked(logger);

jest.mock('nhs-notify-web-template-management-utils/lambda-cognito-authorizer');
const lambdaCognitoAuthorizer = mock<LambdaCognitoAuthorizer>();
jest
  .mocked(LambdaCognitoAuthorizer)
  .mockImplementation(() => lambdaCognitoAuthorizer);

jest.mock('@aws-sdk/client-cognito-identity-provider');
const cognitoClientMock = mock<CognitoIdentityProviderClient>();

jest
  .mocked(CognitoIdentityProviderClient)
  .mockImplementation(() => cognitoClientMock);

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
    internalUserId: 'user-1234',
    clientId: 'client-123',
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
  jest.clearAllMocks();
  process.env.USER_POOL_ID = 'user-pool-id';
  process.env.USER_POOL_CLIENT_ID = 'user-pool-client-id';
});

afterEach(() => {
  process.env = originalEnv;
});

test('returns Allow policy on valid token with clientId', async () => {
  lambdaCognitoAuthorizer.authorize.mockResolvedValue({
    success: true,
    internalUserId: 'user-1234',
    clientId: 'client-123',
  });

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      requestContext,
      headers: { Authorization: 'jwt' },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(allowPolicy);
  expect(mockLogger.warn).not.toHaveBeenCalled();
  expect(mockLogger.error).not.toHaveBeenCalled();

  expect(lambdaCognitoAuthorizer.authorize).toHaveBeenCalledWith(
    'user-pool-id',
    'user-pool-client-id',
    'jwt'
  );
});

test('returns Deny policy on lambda misconfiguration', async () => {
  process.env.USER_POOL_ID = '';

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      requestContext,
      headers: { Authorization: '123' },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
  expect(mockLogger.error).toHaveBeenCalledWith('Lambda misconfiguration');
});

test('returns Deny policy if no Authorization token in header', async () => {
  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      requestContext,
      headers: { Authorization: undefined },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
});

test('returns Deny policy when authorization fails', async () => {
  lambdaCognitoAuthorizer.authorize.mockResolvedValue({
    success: false,
  });

  const res = await handler(
    mock<APIGatewayRequestAuthorizerEvent>({
      requestContext,
      headers: { Authorization: 'jwt' },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
});
