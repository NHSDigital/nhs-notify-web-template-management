import { randomUUID } from 'node:crypto';
import { RoutingConfig } from 'nhs-notify-backend-client';

export const RoutingConfigFactory = {
  create(
    routingConfig: Partial<RoutingConfig> & Pick<RoutingConfig, 'clientId'>
  ): RoutingConfig & { owner: string } {
    return {
      id: randomUUID(),
      owner: `CLIENT#${routingConfig.clientId}`,
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
      status: 'DRAFT',
      name: 'Test config',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...routingConfig,
    };
  },
};
