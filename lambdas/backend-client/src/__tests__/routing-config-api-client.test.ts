import MockAdapter from 'axios-mock-adapter';
import {
  routingConfigurationApiClient as client,
  httpClient,
} from '../routing-config-api-client';
import { RoutingConfig, RoutingConfigStatus } from '../types/generated';
import { ErrorCase } from '../types/error-cases';

const validRoutingConfigId = '2a4b6c8d-0e1f-4a2b-9c3d-5e6f7a8b9c0d';
const notFoundRoutingConfigId = '3b5d7f9a-1c2e-4b3d-8f0a-6e7d8c9b0a1f';
const invalidRoutingConfigId = 'not-a-uuid';

describe('RoutingConfigurationApiClient', () => {
  const axiosMock = new MockAdapter(httpClient);

  beforeEach(() => {
    axiosMock.reset();
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

  describe('get', () => {
    it('should return error when failing to fetch from API', async () => {
      axiosMock
        .onGet(`/v1/routing-configuration/${notFoundRoutingConfigId}`)
        .reply(404, {
          statusCode: 404,
          technicalMessage: 'Not Found',
          details: { message: 'Routing configuration not found' },
        });

      const response = await client.get('mock-token', notFoundRoutingConfigId);

      expect(response.error).toEqual({
        errorMeta: {
          code: 404,
          description: 'Not Found',
          details: { message: 'Routing configuration not found' },
        },
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should return error for invalid routing config ID', async () => {
      const response = await client.get('mock-token', invalidRoutingConfigId);

      expect(response.error).toEqual({
        errorMeta: {
          code: ErrorCase.VALIDATION_FAILED,
          description: 'Invalid routing configuration ID format',
          details: { id: invalidRoutingConfigId },
        },
        actualError: undefined,
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.get.length).toBe(0);
    });

    it('should return routing configuration on success', async () => {
      const data = {
        id: validRoutingConfigId,
        name: 'Test message plan',
        status: 'DRAFT' as RoutingConfigStatus,
        clientId: 'client-1',
        campaignId: 'campaign-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      axiosMock
        .onGet(`/v1/routing-configuration/${validRoutingConfigId}`)
        .reply(200, {
          data,
        });

      const response = await client.get('mock-token', validRoutingConfigId);

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(data);
      expect(axiosMock.history.get.length).toBe(1);
    });
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

  describe('update', () => {
    it('should return error when failing to update via API', async () => {
      axiosMock
        .onPut(`/v1/routing-configuration/${notFoundRoutingConfigId}`)
        .reply(404, {
          statusCode: 404,
          technicalMessage: 'Not Found',
          details: { message: 'Routing configuration not found' },
        });

      const body = {
        id: notFoundRoutingConfigId,
        name: 'Test plan',
        campaignId: 'campaign-1',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      const response = await client.update(
        'test-token',
        notFoundRoutingConfigId,
        body
      );

      expect(response.error).toEqual({
        errorMeta: {
          code: 404,
          description: 'Not Found',
          details: { message: 'Routing configuration not found' },
        },
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.put.length).toBe(1);
    });

    it('should return error for invalid routing config ID', async () => {
      const body = {
        id: invalidRoutingConfigId,
        name: 'Test plan',
        campaignId: 'campaign-1',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      const response = await client.update(
        'mock-token',
        invalidRoutingConfigId,
        body
      );

      expect(response.error).toEqual({
        errorMeta: {
          code: ErrorCase.VALIDATION_FAILED,
          description: 'Invalid routing configuration ID format',
          details: { id: invalidRoutingConfigId },
        },
        actualError: undefined,
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.get.length).toBe(0);
    });

    it('should return updated routing configuration on success', async () => {
      const body = {
        id: validRoutingConfigId,
        name: 'Updated Plan',
        campaignId: 'campaign-1',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      axiosMock
        .onPut(`/v1/routing-configuration/${validRoutingConfigId}`)
        .reply(200, {
          data: body,
        });

      const response = await client.update(
        'test-token',
        validRoutingConfigId,
        body
      );

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(body);
      expect(axiosMock.history.put.length).toBe(1);
    });
  });

  describe('submit', () => {
    it('should return updated routing configuration on success', async () => {
      axiosMock
        .onPatch(`/v1/routing-configuration/${validRoutingConfigId}/submit`)
        .reply(200, {
          data: { id: validRoutingConfigId },
        });

      const response = await client.submit(validRoutingConfigId, 'test-token');

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual({ id: validRoutingConfigId });
      expect(axiosMock.history.patch.length).toBe(1);
    });

    it('should return error when failing to update via API', async () => {
      axiosMock
        .onPatch(`/v1/routing-configuration/${notFoundRoutingConfigId}/submit`)
        .reply(404, {
          statusCode: 404,
          technicalMessage: 'Not Found',
          details: { message: 'Routing configuration not found' },
        });

      const response = await client.submit(
        notFoundRoutingConfigId,
        'test-token'
      );

      expect(response.error).toEqual({
        errorMeta: {
          code: 404,
          description: 'Not Found',
          details: { message: 'Routing configuration not found' },
        },
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.patch.length).toBe(1);
    });

    it('should return error for invalid routing config ID', async () => {
      const response = await client.submit(
        invalidRoutingConfigId,
        'test-token'
      );

      expect(response.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Invalid routing configuration ID format',
          details: { id: invalidRoutingConfigId },
        },
      });
      expect(axiosMock.history.length).toBe(0);
    });
  });
});
