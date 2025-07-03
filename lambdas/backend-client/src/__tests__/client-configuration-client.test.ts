import { AxiosInstance } from 'axios';
import { createAxiosClient } from '../axios-client';
import { ClientConfigurationApiClient } from '../client-configuration';
import MockAdapter from 'axios-mock-adapter';

describe('ClientConfiguration', () => {
  const axiosClient = createAxiosClient();
  const axiosMock = new MockAdapter(axiosClient);

  it('should return client details', async () => {
    const client = await new ClientConfigurationApiClient(
      axiosMock as unknown as AxiosInstance
    ).fetch('token');

    expect(client).toEqual({
      campaignId: 'example-campaignId',
      features: {
        proofing: true,
      },
    });
  });
});
