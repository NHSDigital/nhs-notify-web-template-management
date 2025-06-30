import {
  PreTokenGenerationLambda,
  PreTokenGenerationV2Event,
} from '../pre-token-generation';

const eventNoCustomAttrs = (): PreTokenGenerationV2Event => ({
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '1633rn1feb68eltvtqkugqlml',
  },
  region: 'eu-west-2',
  request: {
    groupConfiguration: {
      groupsToOverride: [],
      iamRolesToOverride: [],
    },
    scopes: ['aws.cognito.signin.user.admin'],
    userAttributes: {
      'cognito:user_status': 'CONFIRMED',
      email: 'example@example.com',
      email_verified: 'True',
      sub: '76c25234-b041-70f2-8ba4-caf538363b35',
    },
  },
  response: {
    claimsAndScopeOverrideDetails: null,
  },
  triggerSource: 'TokenGeneration_Authentication',
  userName: '76c25234-b041-70f2-8ba4-caf538363b35',
  userPoolId: 'eu-west-2_W8aROHYoW',
  version: '2',
});

describe('when user has no custom:sbx attributes', () => {
  test('does not add any claims', async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventNoCustomAttrs()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toBe(null);
  });
});

const eventWithCustomAttr = (): PreTokenGenerationV2Event => ({
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '1633rn1feb68eltvtqkugqlml',
  },
  region: 'eu-west-2',
  request: {
    groupConfiguration: {
      // unexpected in sandbox, and ignored
      groupsToOverride: ['client:253ba86a-1e2a-4bc3-9625-31d91c87bb6a'],
      iamRolesToOverride: [],
    },
    scopes: ['aws.cognito.signin.user.admin'],
    userAttributes: {
      'cognito:user_status': 'CONFIRMED',
      email: 'example@example.com',
      email_verified: 'True',
      sub: '76c25234-b041-70f2-8ba4-caf538363b35',
      'custom:sbx_client_id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
    },
  },
  response: {
    claimsAndScopeOverrideDetails: null,
  },
  triggerSource: 'TokenGeneration_Authentication',
  userName: '76c25234-b041-70f2-8ba4-caf538363b35',
  userPoolId: 'eu-west-2_W8aROHYoW',
  version: '2',
});

describe('when user has custom:sbx_client_id attribute', () => {
  test('adds nhs-notify:client-id claim from custom attribute in event', async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventWithCustomAttr()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toEqual({
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
        },
      },
    });
  });
});
