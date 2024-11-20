// eslint-disable no-console

import type { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { z } from 'zod';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { logger } from './logger';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-west-2',
});

const $AccessToken = z.object({
  client_id: z.string(),
  iss: z.string(),
  token_use: z.string(),
});

const generatePolicy = (Resource: string, Effect: 'Allow' | 'Deny') => ({
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
});

const getEnvironmentVariable = (envName: string) => process.env[envName];

export const handler: APIGatewayTokenAuthorizerHandler = async ({
  methodArn,
  authorizationToken,
}) => {
  try {
    const userPoolId = getEnvironmentVariable('USER_POOL_ID');
    const userPoolClientId = getEnvironmentVariable('USER_POOL_CLIENT_ID');

    if (!userPoolId || !userPoolClientId) {
      logger.error('Lambda misconfiguration');
      return generatePolicy(methodArn, 'Deny');
    }

    const decodedToken = jwtDecode(authorizationToken);

    const {
      client_id: clientId,
      iss,
      token_use: tokenUse,
    } = $AccessToken.parse(decodedToken);

    // client_id claim
    if (clientId !== userPoolClientId) {
      logger.warn(
        `Token has invalid client ID, expected ${userPoolClientId} but received ${clientId}`
      );
      return generatePolicy(methodArn, 'Deny');
    }

    // iss claim
    if (iss !== `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}`) {
      logger.warn(
        `Token has invalid issuer, expected https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId} but received ${iss}`
      );
      return generatePolicy(methodArn, 'Deny');
    }

    // token_use claim
    if (tokenUse !== 'access') {
      logger.warn(
        `Token has invalid token_use, expected access but received ${tokenUse}`
      );
      return generatePolicy(methodArn, 'Deny');
    }

    // cognito SDK call
    await cognitoClient.send(
      new GetUserCommand({
        AccessToken: authorizationToken,
      })
    );

    return generatePolicy(methodArn, 'Allow');
  } catch (error) {
    logger.error(error);
    return generatePolicy(methodArn, 'Deny');
  }
};
