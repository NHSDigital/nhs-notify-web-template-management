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
import { CredentialsFile } from './credentials-file';

export type TestUserCredential = {
  user: { email: string };
  password: string;
  accessToken: string;
  refreshToken: string;
};

export type TestUser = {
  email: string;
  getAccessToken(): Promise<string>;
};

export enum TestUserId {
  User1 = 'User1',
  User2 = 'User2',
}

export class CognitoAuthHelper {
  private static credentialsFile = new CredentialsFile(
    path.resolve(__dirname, '..', '..', '.auth', 'test-credentials.json')
  );

  private client = new CognitoIdentityProviderClient();

  constructor(
    public runId: string,
    public readonly userPoolId: string,
    public readonly userPoolClientId: string
  ) {}

  public async setup() {
    await Promise.all(
      Object.values(TestUserId).map(async (id) => {
        await this.createUser(id);
        await this.passwordAuth(id);
      })
    );
  }

  public async teardown() {
    const credentials = await CognitoAuthHelper.credentialsFile.values(
      this.runId
    );

    await Promise.all(
      credentials.map(({ user }) => this.deleteUser(user.email))
    );

    await CognitoAuthHelper.credentialsFile.destroyNamespace(this.runId);
  }

  public async getAccessToken(id: TestUserId) {
    const credential = await CognitoAuthHelper.credentialsFile.get(
      this.runId,
      id
    );

    if (credential) {
      if (!CognitoAuthHelper.isTokenExpired(credential.accessToken)) {
        return credential.accessToken;
      }

      if (credential.refreshToken) {
        return this.refreshUserAccessToken(id, credential.refreshToken);
      }
    }

    return this.passwordAuth(id);
  }

  public async getTestUser(id: TestUserId): Promise<TestUser> {
    const credential = await CognitoAuthHelper.credentialsFile.get(
      this.runId,
      id
    );

    if (!credential || !credential.user) {
      throw new Error('User not found');
    }

    return {
      ...credential.user,
      getAccessToken: () => this.getAccessToken(id),
    };
  }

  private async createUser(id: TestUserId): Promise<void> {
    const email = faker.internet.exampleEmail();
    const tempPassword = CognitoAuthHelper.generatePassword();

    await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'True' },
        ],
        TemporaryPassword: tempPassword,
        DesiredDeliveryMediums: ['EMAIL'],
        MessageAction: 'SUPPRESS',
      })
    );

    await CognitoAuthHelper.credentialsFile.set(this.runId, id, {
      user: { email },
      password: tempPassword,
    });
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

  private async passwordAuth(id: TestUserId) {
    const credential = await CognitoAuthHelper.credentialsFile.get(
      this.runId,
      id
    );

    if (!credential || !credential.user?.email || !credential.password) {
      throw new Error('Unable to retrieve credentials');
    }

    const initiateAuthResult = await this.client.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.userPoolClientId,
        AuthParameters: {
          USERNAME: credential.user.email,
          PASSWORD: credential.password,
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
            USERNAME: credential.user.email,
            NEW_PASSWORD: newPassword,
          },
        })
      );

      await CognitoAuthHelper.credentialsFile.set(this.runId, id, {
        password: newPassword,
      });

      authResult = respondToAuthChallengeResult.AuthenticationResult;
    }

    if (!authResult) {
      throw new Error('No credentials returned');
    }

    const accessToken = authResult.AccessToken || '';

    await CognitoAuthHelper.credentialsFile.set(this.runId, id, {
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

    await CognitoAuthHelper.credentialsFile.set(this.runId, id, {
      accessToken: response.AuthenticationResult?.AccessToken || '',
      refreshToken: response.AuthenticationResult?.RefreshToken || refreshToken,
    });

    return response.AuthenticationResult?.AccessToken || '';
  }

  private static generatePassword() {
    const digits = crypto.randomInt(1000, 10_000);
    const word = faker.word.sample(4);
    const word2 = faker.word.sample(4);
    return `${word.toUpperCase()}-${word2.toLowerCase()}-${digits}`;
  }

  private static isTokenExpired(token: string) {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    return exp * 1000 < Date.now();
  }
}

export function createAuthHelper() {
  return new CognitoAuthHelper(
    process.env.PLAYWRIGHT_RUN_ID,
    process.env.COGNITO_USER_POOL_ID,
    process.env.COGNITO_USER_POOL_CLIENT_ID
  );
}
