import { PreAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '../pre-authentication';

function makeEvent(
  userAttributes: Record<string, string>
): PreAuthenticationTriggerEvent {
  return {
    request: { userAttributes },
    userName: 'user-name',
    userPoolId: 'user-pool-id',
    version: 'version',
    region: 'region',
    triggerSource: 'PreAuthentication_Authentication',
    callerContext: {
      awsSdkVersion: 'aws-sdk',
      clientId: '1h2g3f',
    },
    response: {},
  };
}

describe('pre authetication handler', () => {
  test('returns original event when user has a client', async () => {
    const event = makeEvent({ 'custom:sbx_client_id': 'id' });

    expect(await handler(event)).toEqual(event);
  });

  test('throws error with message PRE_AUTH_NO_CLIENT_FAILURE when no client is configured', async () => {
    const event = makeEvent({});

    await expect(handler(event)).rejects.toThrow('PRE_AUTH_NO_CLIENT_FAILURE');
  });
});
