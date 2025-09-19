import { MessageProviderPact } from '@pact-foundation/pact';
import { getMessageProviders, getPactUrls } from './utils/utils';

describe('Template management message provider tests', () => {
  const p = new MessageProviderPact({
    provider: 'template-management',
    messageProviders: getMessageProviders(),
    pactUrls: [...getPactUrls('@nhsdigital/notify-core-consumer-contracts')],
    logLevel: 'error',
  });

  test('verify pacts', async () => {
    await expect(p.verify()).resolves.not.toThrow();
  }, 60_000);
});
