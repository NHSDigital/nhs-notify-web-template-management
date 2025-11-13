import {
  getRoutingConfig,
  updateRoutingConfig,
  getTemplatesByIds,
  getMessagePlanTemplates,
  getRoutingConfigs,
  countRoutingConfigs,
  createRoutingConfig,
} from '@utils/message-plans';
import { getSessionServer } from '@utils/amplify-utils';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client/src/routing-config-api-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { getTemplate } from '@utils/form-actions';
import type {
  CascadeGroupName,
  Channel,
  ChannelType,
  Result,
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { randomUUID } from 'node:crypto';

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/routing-config-api-client');
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
const validTemplateId = 'd4e5f6a7-b8c9-40d1-ef23-ab45cd67ef89';

const validCascadeItem = {
  cascadeGroups: ['standard' as CascadeGroupName],
  channel: 'EMAIL' as Channel,
  channelType: 'primary' as ChannelType,
  defaultTemplateId: validTemplateId,
};

const baseConfig: RoutingConfig = {
  id: validRoutingConfigId,
  name: 'Test message plan',
  status: 'DRAFT' as RoutingConfigStatus,
  clientId: 'client-1',
  campaignId: 'campaign-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  cascade: [validCascadeItem],
  cascadeGroupOverrides: [{ name: 'standard' }],
};

describe('Message plans actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getSessionServerMock.mockResolvedValue({
      accessToken: 'mock-token',
      clientId: 'client-1',
    });
  });

  describe('getRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });
      await expect(getRoutingConfigs()).rejects.toThrow(
        'Failed to get access token'
      );
      expect(routingConfigApiMock.get).not.toHaveBeenCalled();
    });

    test('should return empty array when calling the API fails', async () => {
      routingConfigApiMock.list.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await getRoutingConfigs();
      expect(response.length).toBe(0);
    });

    test('should return a list of routing configs - order by createdAt and then id', async () => {
      const fields = {
        status: 'DRAFT',
        name: 'Routing config',
        createdAt: '2020-01-01T00:00:00.000Z',
        campaignId: 'campaignId',
        clientId: 'clientId',
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: 'id',
            cascadeGroups: ['standard'],
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      } satisfies Omit<RoutingConfig, 'id' | 'updatedAt'>;

      const routingConfigs = [
        {
          ...fields,
          id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '8f5157fe-72d7-4a9c-818f-77c128ec8197',
          updatedAt: '2020-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '1cfdd62d-9eca-4f15-9772-1937d4524c37',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '18da6158-07ef-455c-9c31-1a4d78a133cf',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '87fb5cbf-708d-49c3-9360-3e37efdc5278',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '0d6408fd-57ea-42f2-aae1-ed9614b67068',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
      ];

      // a48... is the newest, 8f5... is the oldest.
      // the others all have the same updatedAt.
      const expectedOrder = [
        'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
        '0d6408fd-57ea-42f2-aae1-ed9614b67068',
        '18da6158-07ef-455c-9c31-1a4d78a133cf',
        '1cfdd62d-9eca-4f15-9772-1937d4524c37',
        '87fb5cbf-708d-49c3-9360-3e37efdc5278',
        '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
        '8f5157fe-72d7-4a9c-818f-77c128ec8197',
      ];

      routingConfigApiMock.list.mockResolvedValueOnce({
        data: routingConfigs,
      });

      const response = await getRoutingConfigs();

      const actualOrder = [];
      for (const routingConfig of response) {
        actualOrder.push(routingConfig.id);
      }

      expect(actualOrder).toEqual(expectedOrder);
    });

    test('invalid routing configs are not listed', async () => {
      routingConfigApiMock.list.mockResolvedValueOnce({
        data: [
          {
            status: 'DRAFT',
            name: 'Routing config',
            updatedAt: '2021-01-01T00:00:00.000Z',
            campaignId: 'campaignId',
            clientId: 'clientId',
            cascade: [],
            cascadeGroupOverrides: [{ name: 'standard' }],
            id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
            createdAt: '2022-01-01T00:00:00.000Z',
          },
        ],
      });

      const response = await getRoutingConfigs();

      expect(response).toEqual([]);
    });
  });

  describe('countRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      getSessionServerMock.mockReset();
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(countRoutingConfigs('DRAFT')).rejects.toThrow(
        'Failed to get access token'
      );
    });

    test('should return 0 when calling the API fails', async () => {
      routingConfigApiMock.count.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await countRoutingConfigs('DRAFT');

      expect(response).toBe(0);
    });

    test('should return count of routing configurations for status', async () => {
      // Note: we're doing this here because we call `getSessionServer` twice
      // and it's only mocked-out once by default.
      getSessionServerMock.mockResolvedValue({
        accessToken: 'token',
        clientId: 'client1',
      });

      routingConfigApiMock.count
        .mockResolvedValueOnce({
          data: { count: 1 },
        })
        .mockResolvedValueOnce({
          data: { count: 5 },
        });

      const draftCount = await countRoutingConfigs('DRAFT');
      const completedCount = await countRoutingConfigs('COMPLETED');

      expect(draftCount).toEqual(1);
      expect(routingConfigApiMock.count).toHaveBeenNthCalledWith(1, 'token', {
        status: 'DRAFT',
      });
      expect(completedCount).toEqual(5);
      expect(routingConfigApiMock.count).toHaveBeenNthCalledWith(2, 'token', {
        status: 'COMPLETED',
      });
    });
  });

  describe('getMessagePlan', () => {
    it('should throw error when missing access token', async () => {
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(getRoutingConfig(validRoutingConfigId)).rejects.toThrow(
        'Failed to get access token'
      );

      expect(routingConfigApiMock.get).not.toHaveBeenCalled();
    });

    it('should return the routing config on success', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({ data: baseConfig });

      const response = await getRoutingConfig(validRoutingConfigId);

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

      const response = await getRoutingConfig(notFoundRoutingConfigId);

      expect(routingConfigApiMock.get).toHaveBeenCalledWith(
        'mock-token',
        notFoundRoutingConfigId
      );
      expect(response).toBeUndefined();
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Failed to get routing configuration',
        expect.objectContaining({
          errorMeta: expect.objectContaining({ code: 404 }),
        })
      );
    });

    it('should return undefined and log error for invalid routing config object', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce({
        data: { ...baseConfig, id: invalidRoutingConfigId },
      });

      const response = await getRoutingConfig(invalidRoutingConfigId);

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

    it('should return undefined if API returns no data', async () => {
      routingConfigApiMock.get.mockResolvedValueOnce(
        {} as Result<RoutingConfig>
      );

      const response = await getRoutingConfig(validRoutingConfigId);

      expect(response).toBeUndefined();
    });
  });

  describe('updateMessagePlan', () => {
    it('should throw when no access token', async () => {
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(
        updateRoutingConfig(validRoutingConfigId, baseConfig)
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

      const response = await updateRoutingConfig(validRoutingConfigId, updated);

      expect(routingConfigApiMock.update).toHaveBeenCalledWith(
        'mock-token',
        validRoutingConfigId,
        updated
      );
      expect(response).toEqual(updated);
      expect(loggerMock.error).not.toHaveBeenCalled();
    });

    it('should return undefined if API returns no data', async () => {
      routingConfigApiMock.update.mockResolvedValueOnce(
        {} as Result<RoutingConfig>
      );

      const response = await updateRoutingConfig(
        validRoutingConfigId,
        baseConfig
      );

      expect(response).toBeUndefined();
    });

    it('should log and return undefined on API error', async () => {
      routingConfigApiMock.update.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await updateRoutingConfig(
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
          errorMeta: expect.objectContaining({ code: 400 }),
        })
      );
    });

    it('should return undefined and log error for invalid routing config object after update', async () => {
      routingConfigApiMock.update.mockResolvedValueOnce({
        data: { ...baseConfig, id: invalidRoutingConfigId },
      });

      const response = await updateRoutingConfig(
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

  describe('getTemplatesById', () => {
    it('should return a map of successful template fetches and ignore undefined', async () => {
      getTemplateMock.mockImplementation(async (id: string) => {
        if (id === 'template-1') return { ...EMAIL_TEMPLATE, id: 'template-1' };
        if (id === 'template-3') return { ...SMS_TEMPLATE, id: 'template-3' };
        if (id === 'template-2') return undefined;
        return undefined;
      });

      const result = await getTemplatesByIds([
        'template-1',
        'template-2',
        'template-3',
      ]);

      expect(getTemplateMock).toHaveBeenCalledTimes(3);
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

    it('should throw an error with the template id when a fetch fails', async () => {
      getTemplateMock.mockImplementation(async (id: string) => {
        if (id === 'template-1') return { ...EMAIL_TEMPLATE, id: 'template-1' };
        if (id === 'template-3') return { ...SMS_TEMPLATE, id: 'template-3' };
        if (id === 'template-2') return undefined;
        if (id === 'error-template') throw new Error('error');
        return undefined;
      });

      await expect(
        getTemplatesByIds([
          'template-1',
          'template-2',
          'template-3',
          'error-template',
        ])
      ).rejects.toThrow('Failed to get template for id error-template');
      expect(getTemplateMock).toHaveBeenCalledTimes(4);
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
            defaultTemplateId: '',
          },
        ],
      };

      const result = await getMessagePlanTemplates(plan);

      expect(getTemplateMock).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('createRoutingConfig', () => {
    test('creates a routing config', async () => {
      const now = new Date();
      const id = randomUUID();

      routingConfigApiMock.create.mockImplementationOnce(async (input) => ({
        data: {
          ...input,
          id,
          clientId: 'client1',
          createdAt: now.toISOString(),
          status: 'DRAFT',
          updatedAt: now.toISOString(),
        },
      }));

      const result = await createRoutingConfig({
        name: 'My Routing Config',
        campaignId: 'my-campaign-id',
        cascade: [
          {
            channelType: 'primary',
            channel: 'NHSAPP',
            cascadeGroups: ['standard'],
            defaultTemplateId: null,
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      });

      expect(routingConfigApiMock.create).toHaveBeenCalledWith(
        {
          name: 'My Routing Config',
          campaignId: 'my-campaign-id',
          cascade: [
            {
              channelType: 'primary',
              channel: 'NHSAPP',
              cascadeGroups: ['standard'],
              defaultTemplateId: null,
            },
          ],
          cascadeGroupOverrides: [{ name: 'standard' }],
        },
        'mock-token'
      );

      expect(result).toEqual({
        id,
        clientId: 'client1',
        createdAt: now.toISOString(),
        status: 'DRAFT',
        updatedAt: now.toISOString(),
        name: 'My Routing Config',
        campaignId: 'my-campaign-id',
        cascade: [
          {
            channelType: 'primary',
            channel: 'NHSAPP',
            cascadeGroups: ['standard'],
            defaultTemplateId: null,
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      });
    });

    test('errors when no token', async () => {
      getSessionServerMock.mockReset();
      getSessionServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(
        createRoutingConfig({
          name: 'My Routing Config',
          campaignId: 'my-campaign-id',
          cascade: [
            {
              channelType: 'primary',
              channel: 'NHSAPP',
              cascadeGroups: ['standard'],
              defaultTemplateId: null,
            },
          ],
          cascadeGroupOverrides: [{ name: 'standard' }],
        })
      ).rejects.toThrow('Failed to get access token');

      expect(routingConfigApiMock.create).not.toHaveBeenCalled();
    });

    test('errors when request fails', async () => {
      routingConfigApiMock.create.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 400,
            description: 'Bad request',
          },
        },
      });

      await expect(
        createRoutingConfig({
          name: 'My Routing Config',
          campaignId: 'my-campaign-id',
          cascade: [
            {
              channelType: 'primary',
              channel: 'NHSAPP',
              cascadeGroups: ['standard'],
              defaultTemplateId: null,
            },
          ],
          cascadeGroupOverrides: [{ name: 'standard' }],
        })
      ).rejects.toThrow('Failed to create message plan');
    });
  });
});
