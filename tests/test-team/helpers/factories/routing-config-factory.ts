import { randomUUID } from 'node:crypto';
import {
  CascadeGroupName,
  Channel,
  ChannelType,
  CreateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import type {
  FactoryRoutingConfigWithModifiers,
  RoutingConfigDbEntry,
} from '../../helpers/types';
import { TestUser } from 'helpers/auth/cognito-auth-helper';
import {
  MessageOrder,
  ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS,
} from 'helpers/enum';

export const RoutingConfigFactory = {
  create(user: TestUser, routingConfig: Partial<RoutingConfig> = {}) {
    const apiPayload: CreateRoutingConfig = {
      campaignId:
        routingConfig.campaignId ?? user.campaignIds?.[0] ?? 'campaign',
      cascade: routingConfig.cascade ?? [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: null,
        },
      ],
      cascadeGroupOverrides: routingConfig.cascadeGroupOverrides ?? [
        { name: 'standard' },
      ],
      name: routingConfig.name ?? 'Test config',
    };

    const apiResponse: RoutingConfig = {
      id: randomUUID(),
      clientId: user.clientId,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 0,
      ...routingConfig,
      ...apiPayload,
    };

    const dbEntry: RoutingConfigDbEntry = {
      owner: `CLIENT#${user.clientId}`,
      createdBy: user.userId,
      updatedBy: user.userId,
      ...apiResponse,
    };

    const factoryObj: FactoryRoutingConfigWithModifiers = {
      apiPayload,
      apiResponse,
      dbEntry,

      addTemplate(channel: Channel, templateId?: string) {
        const id = templateId ?? randomUUID();
        for (const key of ['apiPayload', 'apiResponse', 'dbEntry'] as const) {
          for (const cascadeItem of this[key].cascade) {
            if (cascadeItem.channel === channel)
              cascadeItem.defaultTemplateId = id;
          }
        }
        return this;
      },

      withTemplates(...channels: Channel[]) {
        for (const channel of channels) {
          this.addTemplate(channel);
        }
        return this;
      },
    };

    return factoryObj;
  },

  createWithChannels(
    user: TestUser,
    channels: Channel[],
    routingConfig: Partial<RoutingConfig> = {}
  ) {
    const cascade = channels.map((channel) => ({
      cascadeGroups: ['standard' as CascadeGroupName],
      channel: channel,
      channelType: 'primary' as ChannelType,
      defaultTemplateId: null,
    }));
    return this.create(user, {
      cascade,
      ...routingConfig,
    });
  },

  createForMessageOrder(
    user: TestUser,
    messageOrder: MessageOrder,
    routingConfig: Partial<RoutingConfig> = {}
  ) {
    const channels = messageOrder.split(',') as Channel[];

    const nameMapping = ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS.find(
      (mapItem) => mapItem.messageOrder === messageOrder
    );
    const planName = nameMapping
      ? `Test config for ${nameMapping.label}`
      : 'Test config';

    return this.createWithChannels(user, channels, {
      name: planName,
      ...routingConfig,
    });
  },
};
