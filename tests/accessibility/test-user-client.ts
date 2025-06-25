import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export class TestUserClient {
  private readonly cognitoClient = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  constructor(private readonly userPoolId: string) {}

  async createTestUser(email: string, password: string, clientId: string) {
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
          {
            Name: 'custom:sbx_client_id',
            Value: clientId,
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

    const userId = res.User?.Attributes?.find(
      (attr) => attr.Name === 'sub'
    )?.Value;

    if (!username || !userId) {
      throw new Error('Error during user creation');
    }

    return { username, userId };
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
