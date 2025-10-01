import {
  $CreateUpdateRoutingConfig,
  CreateUpdateRoutingConfig,
  ErrorCase,
  type Result,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { failure } from '@backend-api/utils/result';
import type { RoutingConfigRepository } from '../infra/routing-config-repository';
import type { User } from 'nhs-notify-web-template-management-utils';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { validate } from '@backend-api/utils/validate';

export class RoutingConfigClient {
  constructor(
    private readonly routingConfigRepository: RoutingConfigRepository,
    private readonly logger: Logger
  ) {}

  async createRoutingConfig(
    routingConfig: CreateUpdateRoutingConfig,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const log = this.logger.child({ routingConfig, user });

    const validationResult = await validate(
      $CreateUpdateRoutingConfig,
      routingConfig
    );

    if (validationResult.error) {
      log
        .child(validationResult.error.errorMeta)
        .error('Request failed validation', validationResult.error.actualError);

      return validationResult;
    }

    const createResult = await this.routingConfigRepository.create(
      validationResult.data,
      user
    );

    if (createResult.error) {
      log
        .child(createResult.error.errorMeta)
        .error(
          'Failed to save routing config to the database',
          createResult.error.actualError
        );

      return createResult;
    }

    return createResult;
  }

  async getRoutingConfig(
    id: string,
    user: User
  ): Promise<Result<RoutingConfig>> {
    const result = await this.routingConfigRepository.get(id, user);

    if (result.data?.status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
    }

    return result;
  }
}
