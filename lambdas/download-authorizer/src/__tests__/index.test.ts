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

const userPoolId = 'user-pool-id';
const userPoolClientId = 'user-pool-client-id';

function makeEvent(
  uri: string,
  cookie: string | undefined,
  customHeaders?: Record<string, string | undefined>
) {
  return {
    Records: [
      {
        cf: {
          request: {
            uri,
            headers: {
              cookie: [{ value: cookie }],
            },
            origin: {
              s3: {
                customHeaders: {
                  'x-user-pool-id': [{ value: userPoolId }],
                  'x-user-pool-client-id': [{ value: userPoolClientId }],
                  ...customHeaders,
                },
              },
            },
          },
        },
      },
    ],
  };
}

describe('download authorizer handler', () => {
  test('returns request, when request is valid', async () => {
    const subject = 'F3FE88F4-4E9E-41EB-BF1E-DC299911968B';

    lambdaCognitoAuthorizer.authorize.mockResolvedValue({
      success: true,
      subject,
    });

    const uri = `/${subject}/template-id/proof1.pdf`;
    const cookie = `CognitoIdentityServiceProvider.${userPoolClientId}.${subject}.AccessToken=jwt`;

    const event = mock<CloudFrontRequestEvent>(makeEvent(uri, cookie));

    const res = await handler(event);

    expect(res).toEqual(event.Records[0].cf.request);
    expect(mockLogger.warn).not.toHaveBeenCalled();
    expect(mockLogger.error).not.toHaveBeenCalled();

    expect(lambdaCognitoAuthorizer.authorize).toHaveBeenCalledWith(
      'user-pool-id',
      'user-pool-client-id',
      'jwt',
      subject
    );
  });
});
