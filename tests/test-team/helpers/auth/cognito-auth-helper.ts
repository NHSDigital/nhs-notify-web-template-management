import crypto from 'node:crypto';
import path from 'node:path';
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { faker } from '@faker-js/faker';
import { AuthContextFile } from './auth-context-file';
import {
  ClientConfigurationHelper,
  type ClientKey,
} from '../client/client-helper';

type TestUserStaticDetails = {
  userId: string;
  clientKey: ClientKey;
};

type TestUserDynamicDetails = {
  email: string;
  clientId: string;
  password: string;
  owner: string;
};

export type TestUserContext = TestUserStaticDetails &
  TestUserDynamicDetails & {
    accessToken: string;
    refreshToken: string;
  };

export const testUsers: Record<string, TestUserStaticDetails> = {
  /**
   * User1 is generally the signed in user
   */
  User1: {
    userId: 'User1',
    clientKey: 'Client1',
  },
  /**
   * User2 provides an alternative user allowing to check for things like template ownership
   */
  User2: {
    userId: 'User2',
    clientKey: 'Client5',
  },
  /**
   * User3 idle user that stays stayed in
   * Proofing is disabled for this user
   */
  User3: {
    userId: 'User3',
    clientKey: 'Client2',
  },
  /**
   * User4 idle user which signs out automatically
   * This user's client does not have a configuration parameter
   */
  User4: {
    userId: 'User4',
    clientKey: 'Client3',
  },
  /**
   * User5 idle user which signs out manually
   */
  User5: {
    userId: 'User5',
    clientKey: 'Client1',
  },
  /**
   * User6 has configuration but no campaignId
   */
  User6: {
    userId: 'User6',
    clientKey: 'Client4',
  },
  /**
   * User7 has a client which has the client ownership feature disabled
   */
  User7: {
    userId: 'User7',
    clientKey: 'Client5',
  },
  /**
   * User8 shares a client with the primary user (User1)
   */
  User8: {
    userId: 'User8',
    clientKey: 'Client1',
  },
};

export type TestUser = TestUserStaticDetails &
  TestUserDynamicDetails & {
    /**
     * Gets an access token for a test user
     * If the token is expired, tries to use refresh token
     * If no valid token or refresh token, obtains one using password auth
     * Password auth implicitly resets temp password if not logged in previously
     */
    getAccessToken(): Promise<string>;
    /**
     * Sets an updated password in local state.
     * The password should already have been updated in Cognito
     * e.g. by using the change password form in the UI
     */
    setUpdatedPassword(password: string): Promise<void>;
  };

export class CognitoAuthHelper {
  private static authContextFile = new AuthContextFile(
    path.resolve(__dirname, '..', '..', '.auth', 'test-auth-context.json')
  );

  private notifyClientHelper: ClientConfigurationHelper;

  private client = new CognitoIdentityProviderClient();

  constructor(
    public runId: string,
    public readonly userPoolId: string,
    public readonly userPoolClientId: string,
    public readonly clientSsmKeyPrefix: string
  ) {
    this.notifyClientHelper = new ClientConfigurationHelper(
      clientSsmKeyPrefix,
      runId
    );
  }

  public async setup() {
    const users = Object.values(testUsers);

    await Promise.all([
      ...users.map((userDetails) => this.createUser(userDetails)),
      this.notifyClientHelper.setup(),
    ]);
  }

  public async teardown() {
    const runCtx = await CognitoAuthHelper.authContextFile.values(this.runId);

    const clientIds = [
      ...new Set(runCtx.flatMap(({ clientId }) => clientId ?? [])),
    ];

    await Promise.all([
      ...runCtx.map(({ email }) => this.deleteUser(email)),
      this.notifyClientHelper.teardown(clientIds),
    ]);

    await CognitoAuthHelper.authContextFile.destroyNamespace(this.runId);
  }

  public async getAccessToken(id: string) {
    const userCtx = await CognitoAuthHelper.authContextFile.get(this.runId, id);

    if (userCtx) {
      if (!CognitoAuthHelper.isTokenExpired(userCtx.accessToken)) {
        return userCtx.accessToken;
      }

      if (userCtx.refreshToken) {
        return this.refreshUserAccessToken(id, userCtx.refreshToken);
      }
    }

    return this.passwordAuth(id);
  }

  public async getTestUser(id: string): Promise<TestUser> {
    const userCtx = await CognitoAuthHelper.authContextFile.get(this.runId, id);

    if (!userCtx) {
      throw new Error('User not found');
    }

    const { runId } = this;

    const user: TestUser = {
      ...userCtx,
      getAccessToken: () => this.getAccessToken(id),
      async setUpdatedPassword(password) {
        await CognitoAuthHelper.authContextFile.set(runId, id, {
          password,
        });
        this.password = password;
      },
    };

    return user;
  }

  private async createUser(userDetails: TestUserStaticDetails): Promise<void> {
    const email = faker.internet.exampleEmail();
    const tempPassword = CognitoAuthHelper.generatePassword();

    const clientId = `${userDetails.clientKey}--${this.runId}`;

    const clientAttribute = clientId
      ? [
          {
            Name: 'custom:sbx_client_id',
            Value: clientId,
          },
        ]
      : [];

    const user = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'True' },
          ...clientAttribute,
        ],
        TemporaryPassword: tempPassword,
        MessageAction: 'SUPPRESS',
      })
    );

    await CognitoAuthHelper.authContextFile.set(
      this.runId,
      userDetails.userId,
      {
        email,
        userId:
          user.User?.Attributes?.find((attr) => attr.Name === 'sub')?.Value ??
          '',
        clientId: clientId,
        clientKey: userDetails.clientKey,
        password: tempPassword,
      }
    );
  }

  private async deleteUser(email: string) {
    await this.client.send(
      new AdminDisableUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      })
    );

    await this.client.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      })
    );
  }

  private async passwordAuth(id: string) {
    const userCtx = await CognitoAuthHelper.authContextFile.get(this.runId, id);

    if (!userCtx?.email || !userCtx.password) {
      throw new Error('Unable to retrieve credentials');
    }

    const initiateAuthResult = await this.client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.userPoolClientId,
        AuthParameters: {
          USERNAME: userCtx.email,
          PASSWORD: userCtx.password,
        },
      })
    );

    let authResult = initiateAuthResult.AuthenticationResult;

    if (initiateAuthResult.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const newPassword = CognitoAuthHelper.generatePassword();

      const respondToAuthChallengeResult = await this.client.send(
        new RespondToAuthChallengeCommand({
          ClientId: this.userPoolClientId,
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          Session: initiateAuthResult.Session,
          ChallengeResponses: {
            USERNAME: userCtx.email,
            NEW_PASSWORD: newPassword,
          },
        })
      );

      await CognitoAuthHelper.authContextFile.set(this.runId, id, {
        password: newPassword,
      });

      authResult = respondToAuthChallengeResult.AuthenticationResult;
    }

    if (!authResult) {
      throw new Error('No credentials returned');
    }

    const accessToken = authResult.AccessToken || '';

    await CognitoAuthHelper.authContextFile.set(this.runId, id, {
      accessToken,
      refreshToken: authResult.RefreshToken || '',
    });

    return accessToken;
  }

  private async refreshUserAccessToken(
    id: string,
    refreshToken: string
  ): Promise<string> {
    const response = await this.client.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: { REFRESH_TOKEN: refreshToken },
        ClientId: this.userPoolClientId,
      })
    );

    await CognitoAuthHelper.authContextFile.set(this.runId, id, {
      accessToken: response.AuthenticationResult?.AccessToken || '',
      refreshToken: response.AuthenticationResult?.RefreshToken || refreshToken,
    });

    return response.AuthenticationResult?.AccessToken || '';
  }

  static generatePassword() {
    const digits = crypto.randomInt(1000, 10_000);
    const word = faker.word.sample(4);
    const word2 = faker.word.sample(4);
    return `${word.toUpperCase()}-${word2.toLowerCase()}-${digits}`;
  }

  private static isTokenExpired(token: string) {
    if (!token) {
      return true;
    }

    // not checking the validity of the token here
    // just if it's exp claim is in the past
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    return !exp || exp * 1000 < Date.now();
  }
}

export function createAuthHelper() {
  return new CognitoAuthHelper(
    process.env.PLAYWRIGHT_RUN_ID,
    process.env.COGNITO_USER_POOL_ID,
    process.env.COGNITO_USER_POOL_CLIENT_ID,
    process.env.CLIENT_SSM_PATH_PREFIX
  );
}
