import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ErrorWithStatusCode } from '../error-with-status-code';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'eu-west-2',
});

export const getOwner = async (
  event: APIGatewayProxyEvent
): Promise<{
  username: string;
  emailAddress: string;
}> => {
  const accessToken = event.headers.Authorization;

  if (!accessToken) {
    throw new ErrorWithStatusCode('Missing access token', 400);
  }

  const { Username, UserAttributes } = await cognitoClient.send(
    new GetUserCommand({
      AccessToken: accessToken,
    })
  );

  if (!Username || !UserAttributes) {
    throw new ErrorWithStatusCode('Missing user', 403);
  }

  const emailAddress = UserAttributes.find(
    ({ Name }) => Name === 'email'
  )?.Value;

  if (!emailAddress) {
    throw new ErrorWithStatusCode('Missing user email address', 403);
  }

  return {
    username: Username,
    emailAddress,
  };
};
