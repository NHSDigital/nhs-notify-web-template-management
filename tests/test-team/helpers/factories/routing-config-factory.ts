import { randomUUID } from 'node:crypto';
import type { RoutingConfig } from 'helpers/types';

export const RoutingConfigFactory = {
  create(
    routingConfig: Partial<RoutingConfig> & Pick<RoutingConfig, 'owner'>
  ): RoutingConfig {
    return {
      id: randomUUID(),
      status: 'DRAFT',
      ...routingConfig,
    };
  },
};
