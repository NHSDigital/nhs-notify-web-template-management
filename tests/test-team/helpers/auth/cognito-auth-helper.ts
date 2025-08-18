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

export type UserIdentityAttributes =
  | 'given_name'
  | 'family_name'
  | 'preferred_username';

type TestUserStaticDetails = {
  userId: string;
  clientKey: ClientKey;
  /**
   * If `userAttributes` is omitted, user will be created with full identity attributes:
   * preferred_username, given_name, and family_name.
   */
  userAttributes?: Array<UserIdentityAttributes>;
};

type TestUserDynamicDetails = {
  email: string;
  clientId: string;
  password: string;
  clientName?: string;
  identityAttributes?: Partial<Record<UserIdentityAttributes, string>>;
};

export type TestUserContext = TestUserStaticDetails &
  TestUserDynamicDetails & {
    accessToken: string;
    idToken: string;
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
   * User2 is missing preferred_username
   */
  User2: {
    userId: 'User2',
    clientKey: 'Client1',
    userAttributes: ['given_name', 'family_name'],
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
   * User5 does not have any name identity claims, defaults to email
   */
  User5: {
    userId: 'User5',
    clientKey: 'Client1',
    userAttributes: [],
  },
  /**
   * User6 has configuration but no campaignId
   */
  User6: {
    userId: 'User6',
    clientKey: 'Client4',
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
     * Gets an ID token for a test user
     * Uses the same fallback logic as getAccessToken
     */
    getIdToken(): Promise<string>;
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
        const refeshedTokens = await this.refreshUserSessionTokens(
          id,
          userCtx.refreshToken
        );
        return refeshedTokens.accessToken;
      }
    }

    const authTokens = await this.passwordAuth(id);
    return authTokens.accessToken;
  }

  public async getIdToken(id: string): Promise<string> {
    const userCtx = await CognitoAuthHelper.authContextFile.get(this.runId, id);

    if (userCtx && !CognitoAuthHelper.isTokenExpired(userCtx.idToken)) {
      return userCtx.idToken;
    }

    if (userCtx?.refreshToken) {
      const refeshedTokens = await this.refreshUserSessionTokens(
        id,
        userCtx.refreshToken
      );
      return refeshedTokens.idToken;
    }

    const authTokens = await this.passwordAuth(id);
    return authTokens.idToken;
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
      getIdToken: () => this.getAccessToken(id),
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
    const clientName = `NHS Test ${userDetails.clientKey.replaceAll(/([a-z])([A-Z])/g, '$1 $2')}`;

    const clientAttributes = [
      { Name: 'custom:sbx_client_id', Value: clientId },
      {
        Name: 'custom:sbx_client_name',
        Value: clientName,
      },
    ];

    const {
      userId,
      userAttributes = ['preferred_username', 'given_name', 'family_name'],
    } = userDetails;

    const identityAttributes: Partial<Record<UserIdentityAttributes, string>> =
      {};

    if (userAttributes.includes('given_name'))
      identityAttributes.given_name = 'Test';

    if (userAttributes.includes('family_name'))
      identityAttributes.family_name = userId;

    if (userAttributes.includes('preferred_username')) {
      const name = [
        identityAttributes.given_name,
        identityAttributes.family_name,
      ]
        .filter(Boolean)
        .join(' ');
      identityAttributes.preferred_username = `Dr ${name}`;
    }

    const user = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'True' },
          ...Object.entries(identityAttributes).map(([Name, Value]) => ({
            Name,
            Value,
          })),
          ...clientAttributes,
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
        clientName: clientName,
        identityAttributes,
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
    const idToken = authResult.IdToken || '';

    await CognitoAuthHelper.authContextFile.set(this.runId, id, {
      accessToken,
      refreshToken: authResult.RefreshToken || '',
      idToken,
    });

    return { accessToken, idToken };
  }

  private async refreshUserSessionTokens(
    id: string,
    refreshToken: string
  ): Promise<{ accessToken: string; idToken: string }> {
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
      idToken: response.AuthenticationResult?.IdToken || '',
    });

    return {
      accessToken: response.AuthenticationResult?.AccessToken || '',
      idToken: response.AuthenticationResult?.IdToken || '',
    };
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
