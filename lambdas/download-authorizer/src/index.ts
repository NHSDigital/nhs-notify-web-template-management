import type { CloudFrontRequest, CloudFrontRequestEvent } from 'aws-lambda';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { parse as parseCookie } from 'cookie';
import { LambdaCognitoAuthorizer } from 'nhs-notify-web-template-management-utils/lambda-cognito-authorizer';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-west-2',
});

export const denial = {
  status: '403',
  statusDescription: 'Forbidden',
  body: '<h1>Access Denied</h1>',
};

export function parseRequest(request: CloudFrontRequest) {
  const clientIdPathComponent = request.uri.split('/')[1] ?? '';

  const customHeaders = request.origin?.s3?.customHeaders;
  const userPoolId = customHeaders?.['x-user-pool-id']?.[0]?.value;
  const userPoolClientId = customHeaders?.['x-user-pool-client-id']?.[0]?.value;

  const cookies = parseCookie(request.headers.cookie?.[0]?.value ?? '');

  const poolScope = `CognitoIdentityServiceProvider.${userPoolClientId}`;

  const lastAuthUser = cookies[`${poolScope}.LastAuthUser`];

  const accessToken = cookies[`${poolScope}.${lastAuthUser}.accessToken`];

  return {
    userPoolId,
    userPoolClientId,
    accessToken,
    clientIdPathComponent,
  };
}

export const handler = async (event: CloudFrontRequestEvent) => {
  const { request } = event.Records[0].cf;

  const { userPoolId, userPoolClientId, accessToken, clientIdPathComponent } =
    parseRequest(request);

  if (!userPoolId || !userPoolClientId) {
    logger.error('Lambda misconfiguration');
    return denial;
  }

  if (!accessToken) {
    logger.warn('Cookie is missing');
    return denial;
  }

  const authorizer = new LambdaCognitoAuthorizer(cognitoClient, logger);

  const authResult = await authorizer.authorize(
    userPoolId,
    userPoolClientId,
    accessToken,
    clientIdPathComponent
  );

  if (authResult.success) return request;

  return denial;
};
