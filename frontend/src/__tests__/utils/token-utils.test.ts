/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import {
  decodeJwt,
  getClaim,
  getClientIdFromToken,
  getIdTokenClaims,
} from '@utils/token-utils';
import { JWT } from 'aws-amplify/auth';

describe('token-utils', () => {
  describe('decodeJwt', () => {
    it('decodes a valid JWT payload', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign({ testKey: 'value', testNum: 1 }, 'secret');
      const claims = decodeJwt(token);

      expect(claims.testKey).toBe('value');
      expect(claims.testNum).toBe(1);
    });
  });

  describe('getClaim', () => {
    it('returns a string when the claim exists (string)', () => {
      const claims = { testKey: 'value' } as unknown as JWT['payload'];

      expect(getClaim(claims, 'testKey')).toBe('value');
    });

    it('returns stringified value for non-strings', () => {
      const claims = { num: 123, bool: true } as unknown as JWT['payload'];

      expect(getClaim(claims, 'num')).toBe('123');
      expect(getClaim(claims, 'bool')).toBe('true');
    });

    it('returns undefined when the claim is missing, null or undefined', () => {
      const claims = { a: null, b: undefined } as unknown as JWT['payload'];

      expect(getClaim(claims, 'missing')).toBeUndefined();
      expect(getClaim(claims, 'a')).toBeUndefined();
      expect(getClaim(claims, 'b')).toBeUndefined();
    });
  });

  describe('getIdTokenClaims', () => {
    it('returns empty object when no token passed', () => {
      expect(getIdTokenClaims()).toEqual({});
    });

    it('includes clientName when present', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign(
        {
          'nhs-notify:client-name': 'Test client',
        },
        'secret'
      );

      const claims = getIdTokenClaims(token);

      expect(claims.clientName).toBe('Test client');
    });

    it('returns undefined clientName when no suitable claim exists', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign({ displayName: 'Test name' }, 'secret');

      const claims = getIdTokenClaims(token);

      expect(claims.clientName).toBeUndefined();
    });

    it('prefers preferred_username as display name when present', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign(
        {
          'nhs-notify:client-name': 'Test client',
          preferred_username: 'Preferred Name',
          display_name: 'Display Name',
          given_name: 'Given',
          family_name: 'Family',
          email: 'user@example.com',
        },
        'secret'
      );

      const claims = getIdTokenClaims(token);

      expect(claims.displayName).toBe('Preferred Name');
    });

    it('falls back to display_name when preferred_username is missing', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign(
        {
          'nhs-notify:client-name': 'Test client',
          display_name: 'Display Name',
          given_name: 'Given',
          family_name: 'Family',
          email: 'user@example.com',
        },
        'secret'
      );

      const claims = getIdTokenClaims(token);

      expect(claims.displayName).toBe('Display Name');
    });

    it('falls back to given_name + family_name when no preferred/display name', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign(
        {
          given_name: 'Given',
          family_name: 'Family',
          email: 'user@example.com',
        },
        'secret'
      );

      const claims = getIdTokenClaims(token);

      expect(claims.clientName).toBeUndefined();
      expect(claims.displayName).toBe('Given Family');
    });

    it('falls back to email when no preferred/display/full name', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign(
        {
          email: 'user@example.com',
        },
        'secret'
      );

      const claims = getIdTokenClaims(token);

      expect(claims.clientName).toBeUndefined();
      expect(claims.displayName).toBe('user@example.com');
    });

    it('returns undefined displayName when no suitable claim exists', () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const token = sign({ clientName: 'client' }, 'secret');

      const claims = getIdTokenClaims(token);

      expect(claims.displayName).toBeUndefined();
    });
  });

  describe('getClientIdFromToken', () => {
    test('returns undefined when client ID not found', async () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const mockAccessToken = sign({}, 'key');

      const clientId = await getClientIdFromToken(mockAccessToken);

      expect(clientId).toBeUndefined();
    });

    test('retrieves client id from access token param', async () => {
      // eslint-disable-next-line sonarjs/hardcoded-secret-signatures
      const mockAccessToken = sign(
        { ['nhs-notify:client-id']: 'client2' },
        'key'
      );

      const clientId = await getClientIdFromToken(mockAccessToken);

      expect(clientId).toEqual('client2');
    });
  });
});
