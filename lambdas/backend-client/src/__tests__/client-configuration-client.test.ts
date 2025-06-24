import { ClientConfiguration } from '../client-configuration-client';

describe('ClientConfiguration', () => {
  it('should return client details', async () => {
    const client = await ClientConfiguration.fetch('token');

    expect(client).toEqual({
      campaignId: 'example-campaignId',
      features: {
        proofing: true,
      },
    });
  });

  it('should check which features enabled', async () => {
    const client = await ClientConfiguration.fetch('token');

    expect(client!.featureEnabled('proofing')).toEqual(true);
  });
});
