import { failure } from '@backend-api/utils/result';
import {
  $CreateRoutingConfig,
  $ListRoutingConfigFilters,
  $LockNumber,
  $UpdateRoutingConfig,
  type ListRoutingConfigFilters,
} from 'nhs-notify-backend-client/schemas';
import { ErrorCase, type Result } from 'nhs-notify-backend-client/types';
import type {
  RoutingConfigReference,
  RoutingConfig,
} from 'nhs-notify-web-template-management-types';
import { validate } from '@backend-api/utils/validate';
import type { RoutingConfigRepository } from '../infra/routing-config-repository';
import type { User } from 'nhs-notify-web-template-management-utils';
import { ClientConfigRepository } from '../infra/client-config-repository';
import { TemplateClient } from './template-client';

export class RoutingConfigClient {
  constructor(
    private readonly routingConfigRepository: RoutingConfigRepository,
    private readonly clientConfigRepository: ClientConfigRepository,
    private readonly templateClient: TemplateClient
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
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
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

    // get the letter templateIds from the validated and make sure they are the same type
    const templateIds =
      validated.cascade
        ?.map((c) => c.conditionalTemplates?.map((t) => t.templateId))
        ?.flat() ?? []; // extract templateIds from validated

    // fetch all the templates of these templateIds
    const templates = await Promise.all(
      templateIds.map((templateId) =>
        this.templateClient.getTemplate(templateId as string, user)
      )
    );

    // check all the templates have campaignIds if they don't have campaignIds, reject the request
    if (templates.some((template) => !template.data?.campaignId)) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'One or more templates do not have a campaign ID'
      );
    }

    // if they do check that those campaignIds are the same if not reject the request
    const uniqueCampaignIds = [
      ...new Set(templates.map((t) => t.data?.campaignId)),
    ];
    if (uniqueCampaignIds.length > 1) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'All templates must have the same campaign ID'
      );
    }

    // if the payload (validateResult) has a campaignId, check it matches with the template campaignId
    // set expectedCampaignId=(if it exist on payload if not, then get from template - must all be the same)
    const expectedCampaignId =
      validated.campaignId === templates[0]?.data?.campaignId
        ? validated.campaignId
        : templates[0]?.data?.campaignId;

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
      lockNumberValidation.data,
      expectedCampaignId as string
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
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
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
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
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
      return failure(ErrorCase.NOT_FOUND, 'Routing configuration not found');
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
