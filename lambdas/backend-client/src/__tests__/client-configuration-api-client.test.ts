import axios from 'axios';
import { ClientConfigurationApiClient } from '../client-configuration-api-client';
import MockAdapter from 'axios-mock-adapter';

describe('ClientConfiguration', () => {
  const axiosMock = new MockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
  });

  it('should return client details', async () => {
    axiosMock.onGet('/v1/client-configuration').reply(200, {
      statusCode: 200,
      campaignId: 'example-campaignId',
      features: {
        proofing: true,
      },
    });

    const apiClient = new ClientConfigurationApiClient();

    const notifyClientConfig = await apiClient.fetch('token');

    expect(notifyClientConfig).toEqual({
      campaignId: 'example-campaignId',
      features: {
        proofing: true,
      },
    });
  });
});
