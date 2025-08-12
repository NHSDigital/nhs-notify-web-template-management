import { jwtDecode } from "jwt-decode";
import { JWT } from "aws-amplify/auth";

export const decodeJwt = (token: string): JWT['payload'] =>
  jwtDecode<JWT['payload']>(token);

export const getClaim = (claims: JWT['payload'], key: string): string | undefined => {
  const value = claims[key];
  return value != null ? String(value) : undefined;
};

export const getIdTokenClaims = (
  idToken: string
): {
  clientName?: string;
  displayName?: string;
} => {
  const claims = decodeJwt(idToken);

  const clientName = getClaim(claims, 'nhs-notify:client-name');

  let displayName;

  const preferredUsername =
    getClaim(claims, 'preferred_username') || getClaim(claims, 'display_name');

  if (preferredUsername) displayName = preferredUsername;
  else {
    const givenName = getClaim(claims, 'given_name');
    const familyName = getClaim(claims, 'family_name');

    if (givenName && familyName) displayName = `${givenName} ${familyName}`;
    else {
      const email = getClaim(claims, 'email');
      if (email) displayName = email;
    }
  }

  return {
    clientName,
    displayName,
  };
};
