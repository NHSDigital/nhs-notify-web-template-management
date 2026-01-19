import { failure } from '@backend-api/utils/result';
import {
  $CreateRoutingConfig,
  $ListRoutingConfigFilters,
  $LockNumber,
  $UpdateRoutingConfig,
  ErrorCase,
  type ListRoutingConfigFilters,
  type RoutingConfigReference,
  type Result,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { validate } from '@backend-api/utils/validate';
import type { RoutingConfigRepository } from '../infra/routing-config-repository';
import type { User } from 'nhs-notify-web-template-management-utils';
import { ClientConfigRepository } from '../infra/client-config-repository';

export class RoutingConfigClient {
  constructor(
    private readonly routingConfigRepository: RoutingConfigRepository,
    private readonly clientConfigRepository: ClientConfigRepository
  ) {}

  async createRoutingConfig(
    payload: unknown,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) return clientConfigurationResult;

    const { data: clientConfiguration } = clientConfigurationResult;

    if (!clientConfiguration?.features.routing) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Routing feature is disabled'
      );
    }

    const validationResult = await validate($CreateRoutingConfig, payload);

    if (validationResult.error) return validationResult;

    const validated = validationResult.data;

    if (!clientConfiguration?.campaignIds?.includes(validated.campaignId)) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid campaign ID in request'
      );
    }

    return this.routingConfigRepository.create(validationResult.data, user);
  }

  async updateRoutingConfig(
    routingConfigId: string,
    payload: unknown,
    user: User,
    lockNumber: number | string
  ): Promise<Result<RoutingConfig>> {
    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      return failure(
        ErrorCase.CONFLICT,
        'Lock number mismatch - Message Plan has been modified since last read'
      );
    }

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) return clientConfigurationResult;

    const { data: clientConfiguration } = clientConfigurationResult;

    if (!clientConfiguration?.features.routing) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Routing feature is disabled'
      );
    }

    const validationResult = await validate($UpdateRoutingConfig, payload);

    if (validationResult.error) return validationResult;

    const validated = validationResult.data;

    if (
      validated.campaignId &&
      !clientConfiguration?.campaignIds?.includes(validated.campaignId)
    ) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid campaign ID in request'
      );
    }

    return this.routingConfigRepository.update(
      routingConfigId,
      validated,
      user,
      lockNumberValidation.data
    );
  }

  async submitRoutingConfig(
    routingConfigId: string,
    user: User,
    lockNumber: number | string
  ): Promise<Result<RoutingConfig>> {
    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      return failure(
        ErrorCase.CONFLICT,
        'Lock number mismatch - Message Plan has been modified since last read'
      );
    }

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) return clientConfigurationResult;

    if (!clientConfigurationResult.data?.features.routing) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Routing feature is disabled'
      );
    }

    return this.routingConfigRepository.submit(
      routingConfigId,
      user,
      lockNumberValidation.data
    );
  }

  async deleteRoutingConfig(
    routingConfigId: string,
    user: User,
    lockNumber: number | string
  ): Promise<Result<undefined>> {
    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      return failure(
        ErrorCase.CONFLICT,
        'Lock number mismatch - Message Plan has been modified since last read'
      );
    }

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) return clientConfigurationResult;

    if (!clientConfigurationResult.data?.features.routing) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Routing feature is disabled'
      );
    }

    const result = await this.routingConfigRepository.delete(
      routingConfigId,
      user,
      lockNumberValidation.data
    );

    if (result.error) return result;

    return { data: undefined };
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

  async countRoutingConfigs(
    user: User,
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
      .query(user.clientId)
      .excludeStatus('DELETED');

    if (parsedFilters.status) {
      query.status(parsedFilters.status);
    }

    return query.count();
  }

  async getRoutingConfigsByTemplateId(
    user: User,
    templateId: string
  ): Promise<Result<RoutingConfigReference[]>> {
    return this.routingConfigRepository.getByTemplateId(
      templateId,
      user.clientId
    );
  }
}
