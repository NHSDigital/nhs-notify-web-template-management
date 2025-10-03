import { failure } from '@backend-api/utils/result';
import {
  $ListRoutingConfigFilters,
  ErrorCase,
  type ListRoutingConfigFilters,
  type Result,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { validate } from '@backend-api/utils/validate';
import type { RoutingConfigRepository } from '../infra/routing-config-repository';

export class RoutingConfigClient {
  constructor(
    private readonly routingConfigRepository: RoutingConfigRepository
  ) {}

  async getRoutingConfig(
    id: string,
    owner: string
  ): Promise<Result<RoutingConfig>> {
    const result = await this.routingConfigRepository.get(id, owner);

    if (result.data?.status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
    }

    return result;
  }

  async listRoutingConfigs(
    owner: string,
    filters?: unknown
  ): Promise<Result<RoutingConfig[]>> {
    let parsedFilters: ListRoutingConfigFilters = {};

    if (filters) {
      const validation = await validate($ListRoutingConfigFilters, filters);

      if (validation.error) {
        return validation;
      }

      parsedFilters = validation.data;
    }

    const query = this.routingConfigRepository
      .query(owner)
      .excludeStatus('DELETED');

    if (parsedFilters.status) {
      query.status(parsedFilters.status);
    }

    return query.list();
  }

  async countRoutingConfigs(
    owner: string,
    filters?: unknown
  ): Promise<Result<{ count: number }>> {
    let parsedFilters: ListRoutingConfigFilters = {};

    if (filters) {
      const validation = await validate($ListRoutingConfigFilters, filters);

      if (validation.error) {
        return validation;
      }

      parsedFilters = validation.data;
    }

    const query = this.routingConfigRepository
      .query(owner)
      .excludeStatus('DELETED');

    if (parsedFilters.status) {
      query.status(parsedFilters.status);
    }

    return query.count();
  }
}
