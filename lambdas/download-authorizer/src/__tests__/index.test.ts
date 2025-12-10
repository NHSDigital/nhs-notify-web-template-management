import type { CloudFrontRequest, CloudFrontRequestEvent } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { denial, handler, parseRequest } from '../index';
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
    const userName = 'CIS2_555555555555';
    const internalUserId = 'user-1234';

    lambdaCognitoAuthorizer.authorize.mockResolvedValue({
      success: true,
      internalUserId,
    });

    const uri = `/${subject}/template-id/proof1.pdf`;
    const cookie = [
      `CognitoIdentityServiceProvider.${userPoolClientId}.${userName}.accessToken=jwt`,
      `CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser=${userName}`,
    ].join('; ');

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

  test('returns denial if no access token is available for the LastAuthUser', async () => {
    const subject = 'F3FE88F4-4E9E-41EB-BF1E-DC299911968B';
    const userName = 'CIS2_555555555555';
    const internalUserId = 'user-1234';

    lambdaCognitoAuthorizer.authorize.mockResolvedValue({
      success: true,
      internalUserId,
    });

    const uri = `/${subject}/template-id/proof1.pdf`;
    const cookie = [
      `CognitoIdentityServiceProvider.${userPoolClientId}.anotheruser.accessToken=jwt`,
      `CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser=${userName}`,
    ].join('; ');

    const event = mock<CloudFrontRequestEvent>(makeEvent(uri, cookie));

    const res = await handler(event);

    expect(res).toEqual(denial);
    expect(mockLogger.warn).toHaveBeenCalledWith('Cookie is missing');

    expect(lambdaCognitoAuthorizer.authorize).not.toHaveBeenCalled();
  });

  test('returns denial if cognito configuration is not present in custom headers', async () => {
    const uri = '/subject/template-id/proof1.pdf';
    const cookie =
      'CognitoIdentityServiceProvider.pool.username.accessToken=jwt; CognitoIdentityServiceProvider.pool.LastAuthUser=username;';

    const event = mock<CloudFrontRequestEvent>(
      makeEvent(uri, cookie, {
        'x-user-pool-id': undefined,
        'x-user-pool-client-id': undefined,
      })
    );

    const res = await handler(event);

    expect(res).toEqual(denial);
    expect(mockLogger.error).toHaveBeenCalledWith('Lambda misconfiguration');

    expect(lambdaCognitoAuthorizer.authorize).not.toHaveBeenCalled();
  });

  test('returns denial if required cookie is not available', async () => {
    const uri = '/subject/template-id/proof1.pdf';
    const cookie = 'k=v; k2=v2';

    const event = mock<CloudFrontRequestEvent>(makeEvent(uri, cookie));

    const res = await handler(event);

    expect(res).toEqual(denial);
    expect(mockLogger.warn).toHaveBeenCalledWith('Cookie is missing');

    expect(lambdaCognitoAuthorizer.authorize).not.toHaveBeenCalled();
  });

  test('returns denial if authorization fails', async () => {
    const uri = '/subject/template-id/proof1.pdf';
    const userName = 'CIS2-int_555555555555';

    const cookie = [
      `CognitoIdentityServiceProvider.${userPoolClientId}.${userName}.accessToken=jwt`,
      `CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser=${userName}`,
    ].join('; ');

    lambdaCognitoAuthorizer.authorize.mockResolvedValue({
      success: false,
    });

    const event = mock<CloudFrontRequestEvent>(makeEvent(uri, cookie));

    const res = await handler(event);

    expect(res).toEqual(denial);
  });
});

describe('parseRequest', () => {
  test('path defaults to empty string if clientId segment cant be extracted', () => {
    const uri = '';
    const request = mock<CloudFrontRequest>(
      makeEvent(uri, 'cookie').Records[0].cf.request
    );

    expect(parseRequest(request).clientIdPathComponent).toBe('');
  });

  test('cookie header defaults to empty string if it is not present on request', () => {
    const request = mock<CloudFrontRequest>(
      makeEvent('/subject/file.txt', undefined).Records[0].cf.request
    );

    expect(parseRequest(request).accessToken).toBe(undefined);
  });
});
