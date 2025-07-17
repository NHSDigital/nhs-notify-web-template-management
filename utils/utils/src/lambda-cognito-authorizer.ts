import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { verify } from 'jsonwebtoken';
import getJwksClient from 'jwks-rsa';
import { jwtDecode } from 'jwt-decode';
import type { Logger } from './logger';
import z from 'zod/v4';

const $AccessToken = z.object({
  client_id: z.string(),
  iss: z.string(),
  token_use: z.string(),
  'nhs-notify:client-id': z.string().optional(),
});

export class LambdaCognitoAuthorizer {
  constructor(
    private readonly cognitoClient: CognitoIdentityProviderClient,
    private readonly logger: Logger
  ) {}

  async authorize(
    userPoolId: string,
    userPoolClientId: string,
    jwt: string,
    expectedSubject?: string
  ): Promise<
    { success: true; subject: string; clientId?: string } | { success: false }
  > {
    const issuer = `https://cognito-idp.eu-west-2.amazonaws.com/${userPoolId}`;

    const jwksClient = getJwksClient({
      jwksUri: `${issuer}/.well-known/jwks.json`,
    });

    try {
      const decodedToken = jwtDecode(jwt, { header: true });

      const { kid } = decodedToken;

      if (!kid) {
        this.logger.warn('Authorization token missing kid');
        return { success: false };
      }

      const key = await jwksClient.getSigningKey(kid);

      const verifiedToken = verify(jwt, key.getPublicKey(), {
        issuer,
      });

      const {
        client_id: tokenUserPoolClientId,
        token_use: tokenUse,
        'nhs-notify:client-id': notifyClientId,
      } = $AccessToken.parse(verifiedToken);

      if (tokenUserPoolClientId !== userPoolClientId) {
        this.logger.warn(
          `Token has invalid client ID, expected ${userPoolClientId} but received ${tokenUserPoolClientId}`
        );
        return { success: false };
      }

      if (tokenUse !== 'access') {
        this.logger.warn(
          `Token has invalid token_use, expected access but received ${tokenUse}`
        );
        return { success: false };
      }

      // cognito SDK call will error if the user has been deleted
      const { Username, UserAttributes } = await this.cognitoClient.send(
        new GetUserCommand({
          AccessToken: jwt,
        })
      );

      if (!Username || !UserAttributes) {
        this.logger.warn('Missing user');
        return { success: false };
      }

      const sub = UserAttributes.find(({ Name }) => Name === 'sub')?.Value;

      if (!sub) {
        this.logger.warn('Missing user subject');
        return { success: false };
      }

      if (expectedSubject !== undefined && expectedSubject !== sub) {
        this.logger.warn('Subject path does not match expected subject');
        return { success: false };
      }

      return { success: true, subject: sub, clientId: notifyClientId };
    } catch (error) {
      this.logger.error('Failed to authorize:', error);
      return { success: false };
    }
  }
}
