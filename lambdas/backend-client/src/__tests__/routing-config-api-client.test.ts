import {
  routingConfigurationApiClient as client,
  httpClient,
} from '../routing-config-api-client';
import MockAdapter from 'axios-mock-adapter';

describe('RoutingConfigurationApiClient', () => {
  const axiosMock = new MockAdapter(httpClient);

  beforeEach(() => {
    axiosMock.reset();
  });

  describe('count', () => {
    it('should return error when failing to fetch from API', async () => {
      axiosMock
        .onGet('/v1/routing-configurations/count', {
          params: { status: 'DRAFT' },
        })
        .reply(400, {
          statusCode: 400,
          technicalMessage: 'Bad request',
          details: {
            message: 'Broken',
          },
        });

      const response = await client.count('token', 'DRAFT');

      expect(response.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Broken',
          },
        },
      });

      expect(response.data).toBeUndefined();

      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should return number of routing configuration', async () => {
      axiosMock
        .onGet('/v1/routing-configurations/count', {
          params: { status: 'COMPLETED' },
        })
        .reply(200, { data: { count: 10 } });

      const response = await client.count('token', 'COMPLETED');

      expect(response.data).toEqual({ count: 10 });

      expect(response.error).toBeUndefined();

      expect(axiosMock.history.get.length).toBe(1);
    });
  });

  describe('list', () => {
    it('should return error when failing to fetch from API', async () => {
      axiosMock.onGet('/v1/routing-configurations').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Broken',
        },
      });

      const response = await client.list('token');

      expect(response.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Broken',
          },
        },
      });

      expect(response.data).toBeUndefined();

      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should return list of routing configuration', async () => {
      const data = {
        campaignId: 'campaignId',
        cascade: [],
        cascadeGroupOverrides: [],
        clientId: 'clientId',
        createdAt: 'today',
        id: '1',
        name: 'name',
        status: 'DRAFT',
        updatedAt: 'today',
      };

      axiosMock.onGet('/v1/routing-configurations').reply(200, {
        data: [data],
      });

      const response = await client.list('token');

      expect(response.data).toEqual([data]);

      expect(response.error).toBeUndefined();

      expect(axiosMock.history.get.length).toBe(1);
    });
  });
});
