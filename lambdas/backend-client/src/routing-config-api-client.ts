import type {
  CountSuccess,
  GetV1RoutingConfigurationsCountData,
  GetV1RoutingConfigurationsData,
  RoutingConfig,
  RoutingConfigSuccess,
  RoutingConfigStatusActive,
  RoutingConfigSuccessList,
} from './types/generated';
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

  async count(
    token: string,
    status: RoutingConfigStatusActive
  ): Promise<Result<{ count: number }>> {
    const url =
      '/v1/routing-configurations/count' satisfies GetV1RoutingConfigurationsCountData['url'];

    const { data, error } = await catchAxiosError(
      httpClient.get<CountSuccess>(url, {
        headers: { Authorization: token },
        params: { status },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async list(token: string): Promise<Result<RoutingConfig[]>> {
    const url =
      '/v1/routing-configurations' satisfies GetV1RoutingConfigurationsData['url'];

    const { data, error } = await catchAxiosError(
      httpClient.get<RoutingConfigSuccessList>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },
};
