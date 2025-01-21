import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export type User = {
  email: string;
  userId: string;
};

export class CognitoUserHelper {
  private readonly _client: CognitoIdentityProviderClient;

  constructor() {
    this._client = new CognitoIdentityProviderClient({
      region: 'eu-west-2',
    });
  }

  async createUser(email: string, temporaryPassword?: string): Promise<User> {
    // Note: we use a unique prefix to that we don't interfere with other users.
    const user = await this._client.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
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
        TemporaryPassword: temporaryPassword,
      })
    );

    if (!user?.User?.Username) {
      throw new Error('Unable to generate cognito user');
    }

    return {
      email,
      userId: String(
        user.User.Attributes?.find((attr) => attr.Name === 'sub')?.Value
      ),
    };
  }

  async getUser(email: string): Promise<User | undefined> {
    try {
      const user = await this._client.send(
        new AdminGetUserCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: email,
        })
      );

      return {
        email: String(
          user.UserAttributes?.find((attr) => attr.Name === 'email')?.Value
        ),
        userId: String(
          user.UserAttributes?.find((attr) => attr.Name === 'sub')?.Value
        ),
      };
    } catch {
      // no-op
    }
  }

  async deleteUser(email: string) {
    // Note: we must disable the user first before we can delete them
    await this._client.send(
      new AdminDisableUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
      })
    );

    await this._client.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
      })
    );
  }
}
