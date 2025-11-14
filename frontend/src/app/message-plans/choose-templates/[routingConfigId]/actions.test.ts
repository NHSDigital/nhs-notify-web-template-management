import { randomUUID } from 'node:crypto';
import { removeTemplateFromMessagePlan } from './actions';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import {
  CascadeGroupName,
  Channel,
  ChannelType,
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
      defaultTemplateId: 'template-1',
    },
    {
      channel: 'SMS' as Channel,
      channelType: 'primary' as ChannelType,
      cascadeGroups: ['standard' as CascadeGroupName],
      defaultTemplateId: 'template-2',
    },
  ],
  cascadeGroupOverrides: [],
  lockNumber: 0,
};

describe('removeTemplateFromMessagePlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes the template from the correct channel and updates the routing configuration', async () => {
    mockGetRoutingConfig.mockResolvedValue(baseConfig);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('channel', 'EMAIL');

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
            defaultTemplateId: 'template-2',
          }),
        ],
      })
    );
  });

  it('refreshes the choose-templates page after successful removal', async () => {
    mockGetRoutingConfig.mockResolvedValue(baseConfig);
    mockUpdateRoutingConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('channel', 'EMAIL');

    await removeTemplateFromMessagePlan(formData);

    expect(redirect).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${routingConfigId}`
    );
  });

  it('throws an error if routing config is not found', async () => {
    mockGetRoutingConfig.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set('routingConfigId', routingConfigId);
    formData.set('channel', 'EMAIL');

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
    formData.set('channel', 'test');

    await expect(removeTemplateFromMessagePlan(formData)).rejects.toThrow(
      /Invalid form data/
    );
  });
});
