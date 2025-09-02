/**
 * @jest-environment node
 */
import { sign } from 'jsonwebtoken';
import { decodeJwt, getClaim, getClientIdFromToken } from '@utils/token-utils';
import { JWT } from 'aws-amplify/auth';

describe('token-utils', () => {
  describe('decodeJwt', () => {
    it('decodes a valid JWT payload', () => {
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

  describe('getClientIdFromToken', () => {
    test('returns undefined when client ID not found', async () => {
      const mockAccessToken = sign({}, 'key');

      const clientId = await getClientIdFromToken(mockAccessToken);

      expect(clientId).toBeUndefined();
    });

    test('retrieves client id from access token param', async () => {
      const mockAccessToken = sign(
        { ['nhs-notify:client-id']: 'client2' },
        'key'
      );

      const clientId = await getClientIdFromToken(mockAccessToken);

      expect(clientId).toEqual('client2');
    });
  });
});
