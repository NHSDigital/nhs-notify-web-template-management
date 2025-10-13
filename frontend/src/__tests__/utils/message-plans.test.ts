import {
  getMessagePlan,
  updateMessagePlan,
  getMessagePlanTemplateIds,
  getTemplatesByIds,
  getMessagePlanTemplates,
} from '@utils/message-plans';
import { getSessionServer } from '@utils/amplify-utils';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { getTemplate } from '@utils/form-actions';
import type {
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE, NHS_APP_TEMPLATE, SMS_TEMPLATE } from '@testhelpers';

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
jest.mock('@utils/form-actions', () => ({
  getTemplate: jest.fn(),
}));

const getSessionServerMock = jest.mocked(getSessionServer);
const routingConfigApiMock = jest.mocked(routingConfigurationApiClient);
const loggerMock = jest.mocked(logger);
const getTemplateMock = jest.mocked(getTemplate);

const validRoutingConfigId = 'a3f1c2e4-5b6d-4e8f-9a2b-1c3d4e5f6a7b';
const notFoundRoutingConfigId = 'b1a2c3d4-e5f6-4890-ab12-cd34ef56ab78';
const invalidRoutingConfigId = 'not-a-uuid';

const baseConfig: RoutingConfig = {
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

      await expect(getMessagePlan(validRoutingConfigId)).rejects.toThrow(
        'Failed to get access token'
      );

      expect(routingConfigApiMock.get).not.toHaveBeenCalled();
    });

    it('should return the routing config on success', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({ data: baseConfig });

      const response = await getMessagePlan(validRoutingConfigId);

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        validRoutingConfigId
      );
      expect(response).toEqual(baseConfig);
    });

    it('should log and return undefined on API error', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 404, description: 'Not found' },
        },
      });

      const response = await getMessagePlan(notFoundRoutingConfigId);

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        notFoundRoutingConfigId
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

    it('should return undefined and log error for invalid routing config object', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({
        data: { ...baseConfig, id: invalidRoutingConfigId },
      });

      const response = await getMessagePlan(invalidRoutingConfigId);

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        invalidRoutingConfigId
      );
      expect(response).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Invalid routing configuration object',
        expect.any(Object)
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
        updateMessagePlan(validRoutingConfigId, baseConfig)
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

      const response = await updateMessagePlan(validRoutingConfigId, updated);

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        validRoutingConfigId,
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

      const response = await updateMessagePlan(
        validRoutingConfigId,
        baseConfig
      );

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        validRoutingConfigId,
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

    it('should return undefined and log error for invalid routing config object after update', async () => {
      routingConfigApiMock.update.mockResolvedValueOnce({
        data: { ...baseConfig, id: invalidRoutingConfigId },
      });

      const response = await updateMessagePlan(
        invalidRoutingConfigId,
        baseConfig
      );

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        invalidRoutingConfigId,
        baseConfig
      );
      expect(response).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Invalid routing configuration object',
        expect.any(Object)
      );
    });
  });

  describe('getMessagePlanTemplateIds', () => {
    it('should collect unique template IDs from defaults and conditionals', () => {
      const plan: RoutingConfig = {
        ...baseConfig,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: 'template-1',
          },
          {
            cascadeGroups: ['standard'],
            channel: 'EMAIL',
            channelType: 'primary',
            conditionalTemplates: [
              { templateId: 'template-2', language: 'fr' },
              { templateId: 'template-3', language: 'fr' },
            ],
          },
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'template-1',
            conditionalTemplates: [
              { templateId: 'template-2', language: 'fr' },
            ],
          },
        ],
      };

      const ids = [...getMessagePlanTemplateIds(plan)].sort();
      expect(ids).toEqual(['template-1', 'template-2', 'template-3']);
    });

    it('should return empty set when there are no templates', () => {
      const plan: RoutingConfig = {
        ...baseConfig,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
          },
        ],
      };
      const ids = getMessagePlanTemplateIds(plan);
      expect(ids.size).toBe(0);
    });
  });

  describe('getTemplatesById', () => {
    it('should return a map of successful template fetches and ignore undefined/rejected', async () => {
      getTemplateMock.mockImplementation(async (id: string) => {
        if (id === 'template-1') return { ...EMAIL_TEMPLATE, id: 'template-1' };
        if (id === 'template-3') return { ...SMS_TEMPLATE, id: 'template-3' };
        if (id === 'template-2') return undefined;
        if (id === 'error-template') throw new Error('error');
        return undefined;
      });

      const result = await getTemplatesByIds([
        'template-1',
        'template-2',
        'template-3',
        'error-template',
      ]);

      expect(getTemplateMock).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        'template-1': expect.objectContaining({
          id: 'template-1',
          name: EMAIL_TEMPLATE.name,
        }),
        'template-3': expect.objectContaining({
          id: 'template-3',
          name: SMS_TEMPLATE.name,
        }),
      });
    });
  });

  describe('getMessagePlanTemplates', () => {
    it('should fetch templates for all IDs in the message plan', async () => {
      const plan: RoutingConfig = {
        ...baseConfig,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: 'template-10',
          },
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            conditionalTemplates: [
              { templateId: 'template-20', language: 'es' },
            ],
          },
        ],
      };

      getTemplateMock.mockImplementation(async (id: string) => {
        if (id === 'template-10')
          return { ...EMAIL_TEMPLATE, id: 'template-10' };
        if (id === 'template-20')
          return {
            ...NHS_APP_TEMPLATE,
            id: 'template-20',
          };
        return undefined;
      });

      const result = await getMessagePlanTemplates(plan);

      expect(getTemplateMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        'template-10': expect.objectContaining({
          id: 'template-10',
          name: EMAIL_TEMPLATE.name,
        }),
        'template-20': expect.objectContaining({
          id: 'template-20',
          name: NHS_APP_TEMPLATE.name,
        }),
      });
    });

    it('should return empty object when plan contains no templates', async () => {
      const plan: RoutingConfig = {
        ...baseConfig,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
          },
        ],
      };

      const result = await getMessagePlanTemplates(plan);

      expect(getTemplateMock).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });
});
