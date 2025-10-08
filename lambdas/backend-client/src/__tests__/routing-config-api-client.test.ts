import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createAxiosClient } from '../axios-client';
import { RoutingConfigurationApiClient } from '../routing-config-api-client';
import { RoutingConfigStatus } from '../types/generated';

jest.mock('../axios-client', () => {
  const actual = jest.requireActual('../axios-client');
  return {
    ...actual,
    createAxiosClient: jest.fn(),
  };
});

const createAxiosClientMock = jest.mocked(createAxiosClient);

describe('RoutingConfigurationApiClient', () => {
  const axiosMock = new MockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    createAxiosClientMock.mockReturnValue(axios);
  });

  describe('get', () => {
    it('should return error when failing to fetch from API', async () => {
      axiosMock.onGet('/v1/routing-configuration/routing-config-1').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: { message: 'Broken' },
      });

      const client = new RoutingConfigurationApiClient();

      const response = await client.get('mock-token', 'routing-config-1');

      expect(response.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: { message: 'Broken' },
        },
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should return routing configuration on success', async () => {
      const data = {
        id: 'routing-config-1',
        name: 'Test message plan',
        status: 'DRAFT' as RoutingConfigStatus,
        clientId: 'client-1',
        campaignId: 'campaign-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      axiosMock.onGet('/v1/routing-configuration/routing-config-1').reply(200, {
        data,
      });

      const client = new RoutingConfigurationApiClient();

      const response = await client.get('mock-token', 'routing-config-1');

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(data);
      expect(axiosMock.history.get.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should return error when failing to update via API', async () => {
      axiosMock.onPut('/v1/routing-configuration/routing-config-2').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: { message: 'Broken' },
      });

      const client = new RoutingConfigurationApiClient();

      const body = {
        id: 'routing-config-2',
        name: 'Test plan',
        status: 'DRAFT' as RoutingConfigStatus,
        clientId: 'client-1',
        campaignId: 'campaign-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      const response = await client.update(
        'test-token',
        'routing-config-2',
        body
      );

      expect(response.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: { message: 'Broken' },
        },
      });
      expect(response.data).toBeUndefined();
      expect(axiosMock.history.put.length).toBe(1);
    });

    it('should return updated routing configuration on success', async () => {
      const body = {
        id: 'routing-config-2',
        name: 'Updated Plan',
        status: 'DRAFT' as RoutingConfigStatus,
        clientId: 'client-1',
        campaignId: 'campaign-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        cascade: [],
        cascadeGroupOverrides: [],
      };

      axiosMock.onPut('/v1/routing-configuration/routing-config-2').reply(200, {
        data: body,
      });

      const client = new RoutingConfigurationApiClient();

      const response = await client.update(
        'test-token',
        'routing-config-2',
        body
      );

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(body);
      expect(axiosMock.history.put.length).toBe(1);
    });
  });
});
