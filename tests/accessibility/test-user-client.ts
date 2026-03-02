import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DeleteParameterCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import type { ClientConfiguration } from 'nhs-notify-web-template-management-types';

export class TestUserClient {
  private readonly cognitoClient = new CognitoIdentityProviderClient({
    region: 'eu-west-2',
  });

  private readonly ssmClient = new SSMClient({ region: 'eu-west-2' });

  constructor(
    private readonly userPoolId: string,
    private readonly clientSsmPathPrefix: string
  ) {}

  async createTestUser(
    email: string,
    password: string,
    clientId: string,
    clientName: string = 'NHS Client accessibility',
    displayUsernameParts: [string, string] | [string, string, string] = [
      'Dr',
      'Test',
      'User',
    ]
  ) {
    await this.ssmClient.send(
      new PutParameterCommand({
        Name: `${this.clientSsmPathPrefix}/${clientId}`,
        Value: JSON.stringify({
          features: { proofing: true },
          campaignIds: ['accessibility-test-campaign'],
        } satisfies ClientConfiguration),
        Overwrite: true,
        Type: 'String',
      })
    );

    const internalUserId = crypto.randomUUID();

    const res = await this.cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:sbx_client_id', Value: clientId },
          { Name: 'custom:sbx_client_name', Value: clientName },
          { Name: 'custom:nhs_notify_user_id', Value: internalUserId },
          { Name: 'given_name', Value: displayUsernameParts.at(-2) },
          { Name: 'family_name', Value: displayUsernameParts.at(-1) },
          { Name: 'preferred_username', Value: displayUsernameParts.join(' ') },
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

    return { username, internalUserId };
  }

  async deleteTestUser(email: string, clientId: string) {
    await this.ssmClient.send(
      new DeleteParameterCommand({
        Name: `${this.clientSsmPathPrefix}/${clientId}`,
      })
    );

    await this.cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
      })
    );
  }
}
