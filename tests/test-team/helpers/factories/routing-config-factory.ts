import { randomUUID } from 'node:crypto';
import {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import type {
  FactoryRoutingConfig,
  RoutingConfigDbEntry,
} from '../../helpers/types';

export const RoutingConfigFactory = {
  create(
    user: { userId: string; clientId: string },
    routingConfig: Partial<RoutingConfig> = {}
  ): FactoryRoutingConfig {
    const apiPayload: CreateUpdateRoutingConfig = {
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

    const apiResponse: RoutingConfig = {
      id: randomUUID(),
      clientId: user.clientId,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...apiPayload,
    };

    const dbEntry: RoutingConfigDbEntry = {
      owner: `CLIENT#${user.clientId}`,
      createdBy: user.userId,
      updatedBy: user.userId,
      ...apiResponse,
    };

    return {
      apiPayload,
      apiResponse,
      dbEntry,
    };
  },
};
