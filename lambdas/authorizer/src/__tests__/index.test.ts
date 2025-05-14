import type { APIGatewayRequestAuthorizerEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { handler } from '../index';
import { LambdaCognitoAuthorizer } from 'nhs-notify-web-template-management-utils/lambda-cognito-authorizer';

const requestContext = {
  accountId: '000000000000',
  apiId: 'api-id',
  stage: 'stage',
};

const methodArn = 'arn:aws:execute-api:eu-west-2:000000000000:api-id/stage/*';

const warnMock = jest.spyOn(logger, 'warn');
const errorMock = jest.spyOn(logger, 'error');

jest.mock('nhs-notify-web-template-management-utils/lambda-cognito-authorizer');

const lambdaCognitoAuthorizer = mock<LambdaCognitoAuthorizer>();

const authorizerConstructorMock = jest.mocked(LambdaCognitoAuthorizer);
// .mockReturnValue(lambdaCognitoAuthorizer);

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
      requestContext,
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
      requestContext,
      headers: { Authorization: undefined },
      type: 'REQUEST',
    }),
    mock<Context>(),
    jest.fn()
  );

  expect(res).toEqual(denyPolicy);
});

test.only('returns Allow policy on valid token', async () => {
  lambdaCognitoAuthorizer.authorize.mockResolvedValue({
    success: true,
    subject: 'sub',
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
  expect(warnMock).not.toHaveBeenCalled();
  expect(errorMock).not.toHaveBeenCalled();
});

// test('returns Deny policy on expired token', async () => {
//   const jwt = sign(
//     {
//       token_use: 'access',
//       client_id: 'user-pool-client-id',
//       iss: 'https://cognito-idp.eu-west-2.amazonaws.com/user-pool-id',
//       exp: 1_640_995_200,
//     },
//     'key',
//     {
//       keyid: 'key-id',
//     }
//   );

//   const res = await handler(
//     mock<APIGatewayRequestAuthorizerEvent>({
//       requestContext,
//       headers: { Authorization: jwt },
//       type: 'REQUEST',
//     }),
//     mock<Context>(),
//     jest.fn()
//   );

//   expect(res).toEqual(denyPolicy);
//   expect(errorMock).toHaveBeenCalledWith(
//     expect.objectContaining({
//       message: 'jwt expired',
//     })
//   );
// });
