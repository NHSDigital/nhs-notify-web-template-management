import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { AppSyncClient, GetGraphqlApiCommand } from '@aws-sdk/client-appsync';
import { AmplifyAppSyncClient } from './amplify-appsync-client';

export class TestUserClient {
  private userPoolId: string | undefined = undefined;

  private readonly cognitoClient = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  private readonly amplifyAppSyncClient = new AmplifyAppSyncClient();

  private readonly appSyncClient = new AppSyncClient({ region: 'eu-west-2' });

  async getUserPoolId() {
    if (this.userPoolId) {
      return this.userPoolId;
    }

    const apiId = await this.amplifyAppSyncClient.getApiId();

    const graphqlAPI = await this.appSyncClient.send(
      new GetGraphqlApiCommand({
        apiId,
      })
    );

    const userPoolId = graphqlAPI.graphqlApi?.userPoolConfig?.userPoolId;

    if (!userPoolId) {
      throw new Error('User pool ID not found');
    }

    this.userPoolId = userPoolId;
    return userPoolId;
  }

  async createTestUser(email: string, password: string) {
    const userPoolId = await this.getUserPoolId();

    const res = await this.cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
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
        UserPoolId: userPoolId,
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
    const userPoolId = await this.getUserPoolId();

    await this.cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: email,
      })
    );
  }
}
