import { RoutingConfig } from 'nhs-notify-web-template-management-types';
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
      cascade: [],
      cascadeGroupOverrides: [],
      name: 'Test config',
      lockNumber: 0,
      ...data,
    };
  },
};
