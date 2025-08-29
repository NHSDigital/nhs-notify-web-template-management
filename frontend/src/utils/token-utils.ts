import { jwtDecode } from 'jwt-decode';
import { JWT } from 'aws-amplify/auth';

export const decodeJwt = (token: string): JWT['payload'] =>
  jwtDecode<JWT['payload']>(token);

export const getClaim = (
  claims: JWT['payload'],
  key: string
): string | undefined => {
  const value = claims[key];
  return value == null ? undefined : String(value);
};

export const getClientIdFromToken = (token: string) => {
  return getClaim(decodeJwt(token), 'nhs-notify:client-id');
};
