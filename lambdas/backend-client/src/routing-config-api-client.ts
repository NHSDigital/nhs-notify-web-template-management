import type {
  CountSuccess,
  GetV1RoutingConfigurationsCountData,
  GetV1RoutingConfigurationsData,
  RoutingConfig,
  RoutingConfigStatusActive,
  RoutingConfigSuccessList,
} from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';

export class RoutingConfigurationApiClient {
  private readonly httpClient = createAxiosClient();

  async count(
    token: string,
    status: RoutingConfigStatusActive
  ): Promise<Result<{ count: number }>> {
    const url =
      '/v1/routing-configurations/count' satisfies GetV1RoutingConfigurationsCountData['url'];

    const { data, error } = await catchAxiosError(
      this.httpClient.get<CountSuccess>(url, {
        headers: { Authorization: token },
        params: { status },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }

  async list(token: string): Promise<Result<RoutingConfig[]>> {
    const url =
      '/v1/routing-configurations' satisfies GetV1RoutingConfigurationsData['url'];

    const { data, error } = await catchAxiosError(
      this.httpClient.get<RoutingConfigSuccessList>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }
}

export const routingConfigurationApiClient =
  new RoutingConfigurationApiClient();
