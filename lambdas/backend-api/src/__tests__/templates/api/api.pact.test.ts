import { Verifier } from '@pact-foundation/pact';
import path from 'node:path';

describe('Pact Verification', () => {
  it('should validate the expectations of the consumer', async () => {
    const opts = {
      provider: 'TemplateService',
      consumerVersionSelectors: [
        {
          latest: true,
        },
      ],
      pactUrls: [
        path.resolve(
          __dirname,
          '../../backend-client/pacts/TemplateClient-TemplateService.json'
        ),
      ],
      providerBaseUrl: 'http://localhost:8080',
      pactBrokerUrl:
        process.env.PACT_BROKER_BASE_URL || 'http://127.0.0.1:8000',
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME || 'pact_workshop',
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || 'pact_workshop',
      // pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: true,
      providerVersion: '1.0.0',
    };

    const verifier = new Verifier(opts);

    await verifier.verifyProvider();
  });
});
