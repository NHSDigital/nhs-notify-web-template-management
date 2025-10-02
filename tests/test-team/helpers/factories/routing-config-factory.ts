import { randomUUID } from 'node:crypto';
import {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import { RoutingConfigDbEntry } from 'helpers/types';

export const RoutingConfigFactory = {
  createDatabaseEntry(
    user: { userId: string; clientId: string },
    routingConfig: Partial<RoutingConfig> = {}
  ): RoutingConfigDbEntry {
    return {
      id: randomUUID(),
      clientId: user.clientId,
      owner: `CLIENT#${user.clientId}`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.userId,
      updatedBy: user.userId,
      ...this.createApiPayload(routingConfig),
    };
  },

  createApiPayload(
    routingConfig: Partial<RoutingConfig> = {}
  ): CreateUpdateRoutingConfig {
    return {
      campaignId: 'campaign-1',
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
      name: 'Test config',
      ...routingConfig,
    };
  },

  toApiResponseRoutingConfig(
    routingConfigDbEntry: RoutingConfigDbEntry
  ): RoutingConfig {
    const {
      owner: _1,
      updatedBy: _2,
      createdBy: _3,
      ...rest
    } = routingConfigDbEntry;

    return rest;
  },
};
