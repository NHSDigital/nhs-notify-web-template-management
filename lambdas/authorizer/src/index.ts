import type { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { z } from 'zod';
import { CognitoIdentityProviderClient, GetUserCommand, GetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { jwtDecode } from 'jwt-decode';

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

export const handler: APIGatewayTokenAuthorizerHandler = async ({ methodArn, authorizationToken }) => {

  try {
    const userPoolId = process.env.USER_POOL_ID;
    const userPoolClientId = process.env.USER_POOL_CLIENT_ID;

    if (!userPoolId || !userPoolClientId) {
      console.error('Lambda misconfiguration');
      return generatePolicy(methodArn, 'Deny');
    }

    const decodedToken = jwtDecode(authorizationToken);

    const { client_id, iss, token_use } = $AccessToken.parse(decodedToken);

    // client_id claim
    if (client_id !== userPoolClientId) {
      console.warn(`Token has invalid client ID, expected ${userPoolClientId} but received ${client_id}`);
      return generatePolicy(methodArn, 'Deny');
    }

    // iss claim
    if (iss !== `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}`) {
      console.warn(`Token has invalid issuer, expected ${userPoolId} but received ${iss}`);
      return generatePolicy(methodArn, 'Deny');
    }

    // token_use claim
    if (token_use !== 'access') {
      console.warn(`Token has invalid token_use, expected access but received ${token_use}`);
      return generatePolicy(methodArn, 'Deny');
    }

    // cognito SDK call
    await cognitoClient.send(new GetUserCommand({
      AccessToken: authorizationToken,
    }));

    return generatePolicy(methodArn, 'Allow');
  } catch (e) {
    console.error(e);
    return generatePolicy(methodArn, 'Deny');
  }
};
