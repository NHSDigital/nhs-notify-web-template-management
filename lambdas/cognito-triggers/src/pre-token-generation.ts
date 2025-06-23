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
    const clientId = event.request.userAttributes['custom:sbx:client_id'];

    if (clientId) {
      response = PreTokenGenerationLambda.setTokenClaims(event, 'accessToken', {
        'nhs-notify:client-id': clientId,
      });

      response = PreTokenGenerationLambda.setTokenClaims(event, 'idToken', {
        'nhs-notify:client-id': clientId,
      });
    }

    return response;
  };

  private static setTokenClaims(
    event: PreTokenGenerationV2Event,
    token: 'accessToken' | 'idToken',
    claim: Record<string, string>
  ): PreTokenGenerationV2Event {
    const e = { ...event };

    const key =
      token === 'accessToken' ? 'accessTokenGeneration' : 'idTokenGeneration';

    const tokenGeneration =
      e.response.claimsAndScopeOverrideDetails?.[key] || {}; // eslint-disable-line security/detect-object-injection

    e.response.claimsAndScopeOverrideDetails = {
      ...e.response.claimsAndScopeOverrideDetails,
      [key]: {
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
