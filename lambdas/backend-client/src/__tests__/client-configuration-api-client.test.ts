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
      clientConfiguration: {
        campaignId: 'example-campaignId',
        features: {
          proofing: true,
        },
      },
    });

    const apiClient = new ClientConfigurationApiClient();

    const notifyClientConfig = await apiClient.fetch('token');

    expect(notifyClientConfig).toEqual({
      data: {
        campaignId: 'example-campaignId',
        features: {
          proofing: true,
        },
      },
    });
  });

  it('returns null if no client found', async () => {
    axiosMock.onGet('/v1/client-configuration').reply(404, {
      statusCode: 404,
      technicalMessage: 'Client configuration is not available',
    });

    const apiClient = new ClientConfigurationApiClient();

    const notifyClientConfig = await apiClient.fetch('token');

    expect(notifyClientConfig).toEqual({
      data: null,
    });
  });

  it('returns error on HTTP error (other than 404)', async () => {
    axiosMock.onGet('/v1/client-configuration').reply(400, {
      statusCode: 200,
      technicalMessage: 'Invalid Request',
    });

    const apiClient = new ClientConfigurationApiClient();

    const notifyClientConfig = await apiClient.fetch('token');

    expect(notifyClientConfig).toEqual({
      error: {
        errorMeta: {
          code: 400,
          details: undefined,
          description: 'Invalid Request',
        },
      },
    });
  });

  it('returns error on malformed configuration', async () => {
    axiosMock.onGet('/v1/client-configuration').reply(200, {
      statusCode: 200,
      clientConfiguration: {
        campaignId: 10_000,
        features: {
          proofing: true,
        },
      },
    });
    const apiClient = new ClientConfigurationApiClient();

    const notifyClientConfig = await apiClient.fetch('token');

    expect(notifyClientConfig).toEqual({
      error: {
        errorMeta: expect.objectContaining({
          code: 500,
          details: expect.arrayContaining([
            expect.objectContaining({
              message: 'Invalid input: expected string, received number',
              path: ['campaignId'],
            }),
          ]),
        }),
      },
    });
  });
});
