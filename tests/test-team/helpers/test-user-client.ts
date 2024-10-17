import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AmplifyAppSyncClient } from './amplify-appsync-client';

export class TestUserClient {
  private readonly cognitoClient = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  private readonly userPoolId: string;

  constructor(amplifyOutputsPathPrefix = '../..') {
    this.userPoolId = new AmplifyAppSyncClient(
      amplifyOutputsPathPrefix
    ).getUserPoolId();
  }

  async createTestUser(email: string, password: string) {
    const res = await this.cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
        MessageAction: 'SUPPRESS',
      })
    );

    await this.cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: password,
        Permanent: true,
      })
    );

    const username = res.User?.Username;

    if (!username) {
      throw new Error('Error during user creation');
    }

    return username;
  }

  async deleteTestUser(email: string) {
    await this.cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      })
    );
  }
}