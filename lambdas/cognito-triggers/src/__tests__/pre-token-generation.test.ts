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
      'custom:sbx_client_name': 'NHS Trust',
      'custom:nhs_notify_user_id': 'user-1234',
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

describe('when user has custom attributes set', () => {
  test(`adds nhs-notify:client-id claim from 'custom:sbx_client_id' attribute in event`, async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventWithCustomAttr()
    );

    expect(result.response.claimsAndScopeOverrideDetails).toMatchObject({
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

  test(`adds nhs-notify:client-name to ID token from 'custom:sbx_client_name' attribute`, async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventWithCustomAttr()
    );

    expect(
      result.response.claimsAndScopeOverrideDetails?.idTokenGeneration
        ?.claimsToAddOrOverride
    ).toMatchObject({
      'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      'nhs-notify:client-name': 'NHS Trust',
      'nhs-notify:internal-user-id': 'user-1234',
    });

    expect(
      result.response.claimsAndScopeOverrideDetails?.accessTokenGeneration
        ?.claimsToAddOrOverride
    ).toMatchObject({
      'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      'nhs-notify:internal-user-id': 'user-1234',
    });
  });
});

describe('when client ID and name are set but identity attributes are not', () => {
  test('does not include any name-related claims', async () => {
    const result = await new PreTokenGenerationLambda().handler(
      eventWithCustomAttr()
    );

    const claims =
      result.response.claimsAndScopeOverrideDetails?.idTokenGeneration
        ?.claimsToAddOrOverride ?? {};

    expect(claims).toMatchObject({
      'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      'nhs-notify:client-name': 'NHS Trust',
    });

    expect(claims).not.toHaveProperty('preferred_username');
    expect(claims).not.toHaveProperty('given_name');
    expect(claims).not.toHaveProperty('family_name');
  });
});

describe('when user has identity user attributes set', () => {
  test('adds name-related claims', async () => {
    const event = eventWithCustomAttr();

    Object.assign(event.request.userAttributes, {
      preferred_username: 'Dr Test User',
      given_name: 'Test',
      family_name: 'User',
    });

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(
      result.response.claimsAndScopeOverrideDetails?.idTokenGeneration
        ?.claimsToAddOrOverride
    ).toMatchObject({
      'nhs-notify:client-id': 'f58d4b65-870c-42c0-8bb6-2941c5be2bec',
      preferred_username: 'Dr Test User',
      given_name: 'Test',
      family_name: 'User',
    });
  });

  test(`adds only 'preferred_username' if only that is set`, async () => {
    const event = eventNoCustomAttrs();
    event.request.userAttributes.preferred_username = 'Test User';

    const result = await new PreTokenGenerationLambda().handler(event);

    expect(
      result.response.claimsAndScopeOverrideDetails?.idTokenGeneration
        ?.claimsToAddOrOverride
    ).toMatchObject({
      preferred_username: 'Test User',
    });
  });
});
