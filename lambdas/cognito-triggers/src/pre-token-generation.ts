/* eslint-disable sonarjs/no-dead-store */
import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';

// Based on actual events received in testing, response.claimsAndScopeOverrideDetails can be null
// This conflicts with the type definition
// Manually override the provided type definition to allow nulls
export type PreTokenGenerationV2Event = Omit<
  PreTokenGenerationV2TriggerEvent,
  'response'
> & {
  response: Omit<
    PreTokenGenerationV2TriggerEvent['response'],
    'claimsAndScopeOverrideDetails'
  > & {
    claimsAndScopeOverrideDetails:
      | PreTokenGenerationV2TriggerEvent['response']['claimsAndScopeOverrideDetails']
      | null;
  };
};

export class PreTokenGenerationLambda {
  handler = async (event: PreTokenGenerationV2Event) => {
    let response = { ...event };
    const { userAttributes } = event.request;

    const clientId = userAttributes['custom:sbx_client_id'];
    const clientName = userAttributes['custom:sbx_client_name'];
    const internalUserId = userAttributes['custom:nhs_notify_user_id'];

    if (clientId) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'accessTokenGeneration',
        { 'nhs-notify:client-id': clientId }
      );

      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { 'nhs-notify:client-id': clientId }
      );
    }

    if (clientName) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { 'nhs-notify:client-name': clientName }
      );
    }

    const preferred =
      userAttributes.preferred_username || userAttributes.display_name;

    if (preferred) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { preferred_username: preferred }
      );
    }
    if (userAttributes.given_name) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { given_name: userAttributes.given_name }
      );
    }
    if (userAttributes.family_name) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { family_name: userAttributes.family_name }
      );
    }

    if (internalUserId) {
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'idTokenGeneration',
        { 'nhs-notify:internal-user-id': internalUserId }
      );
      response = PreTokenGenerationLambda.setTokenClaims(
        response,
        'accessTokenGeneration',
        { 'nhs-notify:internal-user-id': internalUserId }
      );
    }

    return response;
  };

  private static setTokenClaims(
    event: PreTokenGenerationV2Event,
    tokenKey: 'accessTokenGeneration' | 'idTokenGeneration',
    claim: Record<string, string>
  ): PreTokenGenerationV2Event {
    const e = { ...event };

    const tokenGeneration =
      e.response.claimsAndScopeOverrideDetails?.[tokenKey] || {}; // eslint-disable-line security/detect-object-injection

    e.response.claimsAndScopeOverrideDetails = {
      ...e.response.claimsAndScopeOverrideDetails,
      [tokenKey]: {
        ...tokenGeneration,
        claimsToAddOrOverride: {
          ...tokenGeneration.claimsToAddOrOverride,
          ...claim,
        },
      },
    };

    return e;
  }
}

export const { handler } = new PreTokenGenerationLambda();
