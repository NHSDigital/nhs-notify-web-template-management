import type {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayRequestAuthorizerHandler,
} from 'aws-lambda';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { LambdaCognitoAuthorizer } from 'nhs-notify-web-template-management-utils/lambda-cognito-authorizer';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-west-2',
});

const getEnvironmentVariable = (envName: string) => process.env[envName];

const generateMethodArn = (
  requestContext: APIGatewayEventRequestContextWithAuthorizer<undefined>
) =>
  `arn:aws:execute-api:eu-west-2:${requestContext.accountId}:${requestContext.apiId}/${requestContext.stage}/*`;

const generatePolicy = (
  Resource: string,
  Effect: 'Allow' | 'Deny',
  context?: { internalUserId: string; clientId?: string }
) => ({
  principalId: 'api-caller',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect,
        Resource,
      },
    ],
  },
  context,
});

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  const { headers, requestContext } = event;
  const methodArn = generateMethodArn(requestContext);

  if (!headers?.Authorization) {
    return generatePolicy(methodArn, 'Deny');
  }

  const userPoolId = getEnvironmentVariable('USER_POOL_ID');
  const userPoolClientId = getEnvironmentVariable('USER_POOL_CLIENT_ID');
  const authorizationToken = headers.Authorization;

  if (!userPoolId || !userPoolClientId) {
    logger.error('Lambda misconfiguration');
    return generatePolicy(methodArn, 'Deny');
  }

  const lambdaCognitoAuthorizer = new LambdaCognitoAuthorizer(
    cognitoClient,
    logger
  );

  const authResult = await lambdaCognitoAuthorizer.authorize(
    userPoolId,
    userPoolClientId,
    authorizationToken
  );

  if (authResult.success) {
    return generatePolicy(methodArn, 'Allow', {
      internalUserId: authResult.internalUserId,
      clientId: authResult.clientId,
    });
  }

  return generatePolicy(methodArn, 'Deny');
};
