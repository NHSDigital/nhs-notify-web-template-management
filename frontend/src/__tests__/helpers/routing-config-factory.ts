import { RoutingConfig } from 'nhs-notify-backend-client';
import { randomUUID } from 'node:crypto';

export const RoutingConfigFactory = {
  create(data?: Partial<RoutingConfig>): RoutingConfig {
    return {
      id: randomUUID(),
      clientId: randomUUID(),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      campaignId: randomUUID(),
      defaultCascadeGroup: 'standard',
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: null,
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
      name: 'Test config',
      lockNumber: 0,
      ...data,
    };
  },
};
