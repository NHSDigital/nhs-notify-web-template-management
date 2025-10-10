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
});
