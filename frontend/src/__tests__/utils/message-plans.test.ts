import { getMessagePlan, updateMessagePlan } from '@utils/message-plans';
import { getSessionServer } from '@utils/amplify-utils';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import type {
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client', () => ({
  routingConfigurationApiClient: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('nhs-notify-web-template-management-utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const getSessionServerMock = jest.mocked(getSessionServer);
const routingConfigApiMock = jest.mocked(routingConfigurationApiClient);
const loggerMock = jest.mocked(logger);

const baseConfig: RoutingConfig = {
  id: 'routing-config-12',
  name: 'Test message plan',
  status: 'DRAFT' as RoutingConfigStatus,
  clientId: 'client-1',
  campaignId: 'campaign-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  cascade: [],
  cascadeGroupOverrides: [],
};

describe('@utils/message-plans', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getSessionServerMock.mockResolvedValue({
      accessToken: 'mock-token',
      clientId: 'client-1',
    });
  });

  describe('getMessagePlan', () => {
    it('should throw error when missing access token', async () => {
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(getMessagePlan('routing-config-12')).rejects.toThrow(
        'Failed to get access token'
      );

      expect(routingConfigApiMock.get).not.toHaveBeenCalled();
    });

    it('should return the routing config on success', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({ data: baseConfig });

      const response = await getMessagePlan('routing-config-12');

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        'routing-config-12'
      );
      expect(response).toEqual(baseConfig);
    });

    it('should log and return undefined on API error', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 404, description: 'Not found' },
        },
      });

      const response = await getMessagePlan('routing-config-6');

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        'routing-config-6'
      );
      expect(response).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to get routing configuration',
        expect.objectContaining({
          error: expect.objectContaining({
            errorMeta: expect.objectContaining({ code: 404 }),
          }),
        })
      );
    });
  });

  describe('updateMessagePlan', () => {
    it('should throw when no access token', async () => {
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(
        updateMessagePlan('routing-config-12', baseConfig)
      ).rejects.toThrow('Failed to get access token');

      expect(routingConfigApiMock.update).not.toHaveBeenCalled();
    });

    it('should return the updated routing config on success', async () => {
      const updated: RoutingConfig = {
        ...baseConfig,
        name: 'Updated Plan',
        updatedAt: '2025-01-02T00:00:00.000Z',
      };

      routingConfigApiMock.update.mockResolvedValueOnce({ data: updated });

      const response = await updateMessagePlan('routing-config-12', updated);

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        'routing-config-12',
        updated
      );
      expect(response).toEqual(updated);
      expect(loggerMock.error).not.toHaveBeenCalled();
    });

    it('should log and return undefined on API error', async () => {
      routingConfigApiMock.update.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await updateMessagePlan('routing-config-12', baseConfig);

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        'routing-config-12',
        baseConfig
      );
      expect(response).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to get routing configuration',
        expect.objectContaining({
          error: expect.objectContaining({
            errorMeta: expect.objectContaining({ code: 400 }),
          }),
        })
      );
    });
  });
});
