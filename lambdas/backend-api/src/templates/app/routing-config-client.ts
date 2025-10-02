import { failure } from '@backend-api/utils/result';
import {
  $CreateUpdateRoutingConfig,
  $ListRoutingConfigFilters,
  ErrorCase,
  type CreateUpdateRoutingConfig,
  type ListRoutingConfigFilters,
  type Result,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { validate } from '@backend-api/utils/validate';
import type { RoutingConfigRepository } from '../infra/routing-config-repository';
import type { User } from 'nhs-notify-web-template-management-utils';

export class RoutingConfigClient {
  constructor(
    private readonly routingConfigRepository: RoutingConfigRepository
  ) {}

  async createRoutingConfig(
    routingConfig: CreateUpdateRoutingConfig,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const validationResult = await validate(
      $CreateUpdateRoutingConfig,
      routingConfig
    );

    if (validationResult.error) return validationResult;

    const createResult = await this.routingConfigRepository.create(
      validationResult.data,
      user
    );

    if (createResult.error) return createResult;

    return createResult;
  }

  async getRoutingConfig(
    id: string,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const result = await this.routingConfigRepository.get(id, user.clientId);

    if (result.data?.status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
    }

    return result;
  }

  async listRoutingConfigs(
    user: User,
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
      .query(user.clientId)
      .excludeStatus('DELETED');

    if (parsedFilters.status) {
      query.status(parsedFilters.status);
    }

    return query.list();
  }
}
