import {
  routingConfigurationApiClient as client,
  httpClient,
} from '../routing-config-api-client';
import MockAdapter from 'axios-mock-adapter';
import { RoutingConfig } from '../types/generated';

describe('RoutingConfigurationApiClient', () => {
  const axiosMock = new MockAdapter(httpClient);

  beforeEach(() => {
    axiosMock.reset();
  });

  describe('create', () => {
    test('should return error', async () => {
      axiosMock.onPost('/v1/routing-configuration').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Something went wrong',
        },
      });

      const result = await client.create(
        {
          name: 'test',
          campaignId: 'campaign-id',
          cascade: [],
          cascadeGroupOverrides: [],
        },
        'test-token'
      );

      expect(result.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Something went wrong',
          },
        },
      });
      expect(result.data).toBeUndefined();

      expect(axiosMock.history.post.length).toBe(1);
    });

    test('should return routing config', async () => {
      const data: RoutingConfig = {
        campaignId: 'campaign-id',
        cascade: [],
        cascadeGroupOverrides: [],
        clientId: 'client-id',
        createdAt: new Date().toISOString(),
        id: 'id',
        name: 'name',
        status: 'DRAFT',
        updatedAt: new Date().toISOString(),
      };

      axiosMock.onPost('/v1/routing-configuration').reply(201, {
        statusCode: 201,
        data,
      });

      const body = {
        campaignId: data.campaignId,
        cascade: data.cascade,
        cascadeGroupOverrides: data.cascadeGroupOverrides,
        name: data.name,
      };

      const result = await client.create(body, 'test-token');

      expect(axiosMock.history.post.length).toBe(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(body);
      expect(axiosMock.history.post[0].headers?.Authorization).toBe(
        'test-token'
      );

      expect(result.data).toEqual(data);

      expect(result.error).toBeUndefined();
    });
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

    it('should return number of routing configurations', async () => {
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

    it('should return list of routing configurations', async () => {
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
