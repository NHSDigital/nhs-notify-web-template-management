import type { RoutingConfig, RoutingConfigSuccess } from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';

export const httpClient = createAxiosClient();

export const routingConfigurationApiClient = {
  async create(
    routingConfig: Pick<
      RoutingConfig,
      'name' | 'campaignId' | 'cascade' | 'cascadeGroupOverrides'
    >,
    token: string
  ): Promise<Result<RoutingConfig>> {
    const response = await catchAxiosError(
      httpClient.post<RoutingConfigSuccess>(
        '/v1/routing-configuration',
        routingConfig,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      )
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.data,
    };
  },
};
