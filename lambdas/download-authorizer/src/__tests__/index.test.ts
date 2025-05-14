import type { CloudFrontRequestEvent } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { handler } from '../index';
import { LambdaCognitoAuthorizer } from 'nhs-notify-web-template-management-utils/lambda-cognito-authorizer';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('download authorizer handler', () => {});

test('returns request, when request is valid', async () => {
  lambdaCognitoAuthorizer.authorize.mockResolvedValue({
    success: true,
    subject: 'sub',
  });

  const res = await handler(
    mock<CloudFrontRequestEvent>({
      Records: [
        {
          cf: {
            request: {
              uri: '',
              headers: {
                cookies: [{ value: '' }],
              },
              origin: {
                s3: {
                  customHeaders: {},
                },
              },
            },
          },
        },
      ],
    })
  );

  expect(res).toEqual({});
  expect(mockLogger.warn).not.toHaveBeenCalled();
  expect(mockLogger.error).not.toHaveBeenCalled();

  expect(lambdaCognitoAuthorizer.authorize).toHaveBeenCalledWith(
    'user-pool-id',
    'user-pool-client-id',
    'jwt'
  );
});

// test('returns Deny policy on lambda misconfiguration', async () => {
//   process.env.USER_POOL_ID = '';

//   const res = await handler(
//     mock<APIGatewayRequestAuthorizerEvent>({
//       requestContext,
//       headers: { Authorization: '123' },
//       type: 'REQUEST',
//     }),
//     mock<Context>(),
//     jest.fn()
//   );

//   expect(res).toEqual(denyPolicy);
//   expect(mockLogger.error).toHaveBeenCalledWith('Lambda misconfiguration');
// });

// test('returns Deny policy if no Authorization token in header', async () => {
//   const res = await handler(
//     mock<APIGatewayRequestAuthorizerEvent>({
//       requestContext,
//       headers: { Authorization: undefined },
//       type: 'REQUEST',
//     }),
//     mock<Context>(),
//     jest.fn()
//   );

//   expect(res).toEqual(denyPolicy);
// });

// test('returns Deny policy when authorization fails', async () => {
//   lambdaCognitoAuthorizer.authorize.mockResolvedValue({
//     success: false,
//   });

//   const res = await handler(
//     mock<APIGatewayRequestAuthorizerEvent>({
//       requestContext,
//       headers: { Authorization: 'jwt' },
//       type: 'REQUEST',
//     }),
//     mock<Context>(),
//     jest.fn()
//   );

//   expect(res).toEqual(denyPolicy);
// });
