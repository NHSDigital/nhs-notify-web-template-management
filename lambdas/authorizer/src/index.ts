// eslint-disable no-console

import type { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { z } from 'zod';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';
import { verify,  } from 'jsonwebtoken';
import { logger } from './logger';
import getJwksClient from 'jwks-rsa';

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

    const issuer = `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}`;

    const jwksClient = getJwksClient({
      jwksUri: `${issuer}/.well-known/jwks.json`
    });

    const decodedToken = jwtDecode(authorizationToken, { header: true });

    const kid = decodedToken.kid;

    if (!kid) {
      logger.warn('Authorization token missing kid');
      return generatePolicy(methodArn, 'Deny');
    }

    const key = await jwksClient.getSigningKey(kid);

    const verifiedToken = verify(authorizationToken, key.getPublicKey(), {
      issuer,
    });

    const {
      client_id: clientId,
      token_use: tokenUse,
    } = $AccessToken.parse(verifiedToken);

    // client_id claim
    if (clientId !== userPoolClientId) {
      logger.warn(
        `Token has invalid client ID, expected ${userPoolClientId} but received ${clientId}`
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

    // cognito SDK call - this will error if the user has been deleted
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
