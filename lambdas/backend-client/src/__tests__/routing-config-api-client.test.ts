import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { createAxiosClient } from '../axios-client';
import {
  isValidUuid,
  RoutingConfigurationApiClient,
} from '../routing-config-api-client';
import { RoutingConfigStatus } from '../types/generated';
import { ErrorCase } from '../types/error-cases';

jest.mock('../axios-client', () => {
  const actual = jest.requireActual('../axios-client');
  return {
    ...actual,
    createAxiosClient: jest.fn(),
  };
});

const createAxiosClientMock = jest.mocked(createAxiosClient);

const validRoutingConfigId = '2a4b6c8d-0e1f-4a2b-9c3d-5e6f7a8b9c0d';
const notFoundRoutingConfigId = '3b5d7f9a-1c2e-4b3d-8f0a-6e7d8c9b0a1f';
const invalidRoutingConfigId = 'not-a-uuid';

describe('RoutingConfigurationApiClient', () => {
  const axiosMock = new MockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    createAxiosClientMock.mockReturnValue(axios);
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

      const client = new RoutingConfigurationApiClient();

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
      const client = new RoutingConfigurationApiClient();

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

      const client = new RoutingConfigurationApiClient();

      const response = await client.get('mock-token', validRoutingConfigId);

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(data);
      expect(axiosMock.history.get.length).toBe(1);
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

      const client = new RoutingConfigurationApiClient();

      const body = {
        id: notFoundRoutingConfigId,
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
      const client = new RoutingConfigurationApiClient();

      const body = {
        id: invalidRoutingConfigId,
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
        id: '4c6e8f0a-2b3d-4c5e-9a1b-7d8c9b0a1f2e',
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
        '4c6e8f0a-2b3d-4c5e-9a1b-7d8c9b0a1f2e',
        body
      );

      expect(response.error).toBeUndefined();
      expect(response.data).toEqual(body);
      expect(axiosMock.history.put.length).toBe(1);
    });
  });

  describe('isValidUuid', () => {
    it('returns true for valid UUID v4', () => {
      expect(isValidUuid('a3f1c2e4-5b6d-4e8f-9a2b-1c3d4e5f6a7b')).toBe(true);
      expect(isValidUuid('b7e2d3c4-8f9a-4b1c-9d2e-3f4a5b6c7d8e')).toBe(true);
    });

    it('returns false for invalid UUIDs', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('123456')).toBe(false);
      expect(isValidUuid('11111111-1111-1111-1111-111111111111')).toBe(false);
    });
  });
});
