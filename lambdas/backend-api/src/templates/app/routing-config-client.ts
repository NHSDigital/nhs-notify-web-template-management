import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import {
  $CreateUpdateRoutingConfig,
  $ListRoutingConfigFilters,
  type CreateUpdateRoutingConfig,
  ErrorCase,
  type ListRoutingConfigFilters,
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
    const validationResult = await validate(
      $CreateUpdateRoutingConfig,
      payload
    );

    if (validationResult.error) return validationResult;

    const validated = validationResult.data;

    const campaignIdValidationResult = await this.validateCampaignId(
      user.clientId,
      validated
    );

    if (campaignIdValidationResult.error) return campaignIdValidationResult;

    return this.routingConfigRepository.create(validated, user);
  }

  async updateRoutingConfig(
    routingConfigId: string,
    payload: unknown,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const validationResult = await validate(
      $CreateUpdateRoutingConfig,
      payload
    );

    if (validationResult.error) return validationResult;

    const validated = validationResult.data;

    const campaignIdValidationResult = await this.validateCampaignId(
      user.clientId,
      validated
    );

    if (campaignIdValidationResult.error) return campaignIdValidationResult;

    return this.routingConfigRepository.update(
      routingConfigId,
      validated,
      user
    );
  }

  async submitRoutingConfig(
    routingConfigId: string,
    user: User
  ): Promise<Result<RoutingConfig>> {
    return this.routingConfigRepository.submit(routingConfigId, user);
  }

  async deleteRoutingConfig(
    routingConfigId: string,
    user: User
  ): Promise<Result<undefined>> {
    const result = await this.routingConfigRepository.delete(
      routingConfigId,
      user
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

  private async validateCampaignId(
    clientId: string,
    data: CreateUpdateRoutingConfig
  ): Promise<ApplicationResult<null>> {
    const clientConfigurationResult =
      await this.clientConfigRepository.get(clientId);

    const { data: clientConfiguration, error: clientConfigurationError } =
      clientConfigurationResult;

    if (clientConfigurationError) return clientConfigurationResult;

    if (!clientConfiguration?.campaignIds?.includes(data.campaignId)) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid campaign ID in request'
      );
    }

    return success(null);
  }
}
