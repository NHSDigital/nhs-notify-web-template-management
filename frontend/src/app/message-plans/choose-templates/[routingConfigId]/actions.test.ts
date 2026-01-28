import { randomUUID } from 'node:crypto';
import { removeTemplateFromMessagePlan } from './actions';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import {
  CascadeGroupName,
  Channel,
  ChannelType,
  Language,
  LetterType,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import { redirect } from 'next/navigation';

jest.mock('@utils/message-plans');
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockGetRoutingConfig = jest.mocked(getRoutingConfig);
const mockUpdateRoutingConfig = jest.mocked(updateRoutingConfig);

const routingConfigId = randomUUID();
const emailTemplateId = randomUUID();
const smsTemplateId = randomUUID();
const polishTemplateId = randomUUID();
const frenchTemplateId = randomUUID();
const largePrintId = randomUUID();

const baseConfig = {
  id: routingConfigId,
  campaignId: 'campaign1',
  name: 'Test',
  clientId: 'client1',
  status: 'DRAFT' as RoutingConfigStatus,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  cascade: [
    {
      channel: 'EMAIL' as Channel,
      channelType: 'primary' as ChannelType,
      cascadeGroups: ['standard' as CascadeGroupName],
      defaultTemplateId: emailTemplateId,
    },
    {
      channel: 'SMS' as Channel,
      channelType: 'primary' as ChannelType,
      cascadeGroups: ['standard' as CascadeGroupName],
      defaultTemplateId: smsTemplateId,
    },
  ],
  cascadeGroupOverrides: [],
  lockNumber: 0,
  defaultCascadeGroup: 'standard',
};

describe('removeTemplateFromMessagePlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes the correct template from the cascade item and updates the routing configuration', async () => {
    mockGetRoutingConfig.mockResolvedValue(baseConfig);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('templateId', emailTemplateId);
    formData.set('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(mockGetRoutingConfig).toHaveBeenCalledWith(routingConfigId);

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      routingConfigId,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            channel: 'EMAIL',
            defaultTemplateId: null,
          }),
          expect.objectContaining({
            channel: 'SMS',
            defaultTemplateId: smsTemplateId,
          }),
        ],
      }),
      42
    );
  });

  it('removes multiple templates at once', async () => {
    const configWithConditionalTemplates = {
      ...baseConfig,
      cascade: [
        {
          ...baseConfig.cascade[0],
          conditionalTemplates: [
            {
              accessibleFormat: 'x1' as LetterType,
              templateId: largePrintId,
            },
            { language: 'pl' as Language, templateId: polishTemplateId },
            { language: 'fr' as Language, templateId: frenchTemplateId },
          ],
        },
        baseConfig.cascade[1],
      ],
    };

    mockGetRoutingConfig.mockResolvedValue(configWithConditionalTemplates);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.append('templateId', polishTemplateId);
    formData.append('templateId', frenchTemplateId);
    formData.append('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      routingConfigId,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            channel: 'EMAIL',
            defaultTemplateId: emailTemplateId,
            conditionalTemplates: [
              {
                accessibleFormat: 'x1',
                templateId: largePrintId,
              },
            ],
          }),
          expect.objectContaining({
            channel: 'SMS',
          }),
        ],
      }),
      42
    );
  });

  it('removes conditional templates from cascade items', async () => {
    const configWithConditionalTemplate = {
      ...baseConfig,
      cascade: [
        {
          ...baseConfig.cascade[0],
          channel: 'LETTER' as Channel,
          conditionalTemplates: [
            { accessibleFormat: 'x1' as LetterType, templateId: largePrintId },
          ],
        },
      ],
    };

    mockGetRoutingConfig.mockResolvedValue(configWithConditionalTemplate);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('templateId', largePrintId);
    formData.set('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      routingConfigId,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            channel: 'LETTER',
          }),
        ],
      }),
      42
    );

    // Verify conditionalTemplates was removed
    const [[, updateConfig]] = mockUpdateRoutingConfig.mock.calls;
    expect(updateConfig.cascade?.[0].conditionalTemplates).toBeUndefined();
  });

  it('updates cascadeGroups on cascade items when templates are removed', async () => {
    const configWithConditionalTemplates = {
      ...baseConfig,
      cascade: [
        {
          channel: 'LETTER' as Channel,
          channelType: 'primary' as ChannelType,
          cascadeGroups: [
            'standard' as CascadeGroupName,
            'accessible' as CascadeGroupName,
            'translations' as CascadeGroupName,
          ],
          defaultTemplateId: emailTemplateId,
          conditionalTemplates: [
            {
              accessibleFormat: 'x1' as LetterType,
              templateId: largePrintId,
            },
            { language: 'pl' as Language, templateId: polishTemplateId },
            { language: 'fr' as Language, templateId: frenchTemplateId },
          ],
        },
      ],
      cascadeGroupOverrides: [],
    };

    mockGetRoutingConfig.mockResolvedValue(configWithConditionalTemplates);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.append('templateId', polishTemplateId);
    formData.append('templateId', frenchTemplateId);
    formData.append('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      routingConfigId,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            channel: 'LETTER',
            cascadeGroups: ['standard', 'accessible'],
            conditionalTemplates: [
              {
                accessibleFormat: 'x1',
                templateId: largePrintId,
              },
            ],
          }),
        ],
      }),
      42
    );
  });

  it('updates cascadeGroups to only standard when all conditional templates are removed', async () => {
    const configWithConditionalTemplates = {
      ...baseConfig,
      cascade: [
        {
          channel: 'LETTER' as Channel,
          channelType: 'primary' as ChannelType,
          cascadeGroups: [
            'standard' as CascadeGroupName,
            'accessible' as CascadeGroupName,
          ],
          defaultTemplateId: emailTemplateId,
          conditionalTemplates: [
            {
              accessibleFormat: 'x1' as LetterType,
              templateId: largePrintId,
            },
          ],
        },
      ],
      cascadeGroupOverrides: [],
    };

    mockGetRoutingConfig.mockResolvedValue(configWithConditionalTemplates);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('templateId', largePrintId);
    formData.set('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
      routingConfigId,
      expect.objectContaining({
        cascade: [
          expect.objectContaining({
            channel: 'LETTER',
            cascadeGroups: ['standard'],
          }),
        ],
      }),
      42
    );

    // Verify conditionalTemplates was removed
    const [[, updateConfig]] = mockUpdateRoutingConfig.mock.calls;
    expect(updateConfig.cascade?.[0].conditionalTemplates).toBeUndefined();
  });

  it('refreshes the choose-templates page after successful removal', async () => {
    mockGetRoutingConfig.mockResolvedValue(baseConfig);
    mockUpdateRoutingConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('templateId', emailTemplateId);
    formData.set('lockNumber', '42');

    await removeTemplateFromMessagePlan(formData);

    expect(redirect).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${routingConfigId}`
    );
  });

  it('throws an error if routing config is not found', async () => {
    mockGetRoutingConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('templateId', emailTemplateId);
    formData.set('lockNumber', '42');

    await expect(removeTemplateFromMessagePlan(formData)).rejects.toThrow(
      /not found/
    );
  });

  it('throws an error if form data is missing', async () => {
    const formData = new FormData();

    await expect(removeTemplateFromMessagePlan(formData)).rejects.toThrow(
      /Invalid form data/
    );
  });

  it('throws an error if form data is invalid', async () => {
    const formData = new FormData();
    formData.set('routingConfigId', 'invalid-id');
    formData.set('templateId', '');
    formData.set('lockNumber', '42');

    await expect(removeTemplateFromMessagePlan(formData)).rejects.toThrow(
      /Invalid form data/
    );
  });
});
