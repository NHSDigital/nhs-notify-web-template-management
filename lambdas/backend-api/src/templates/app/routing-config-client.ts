import {
  ErrorCase,
  type Result,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { failure } from '@backend-api/utils/result';
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
}
