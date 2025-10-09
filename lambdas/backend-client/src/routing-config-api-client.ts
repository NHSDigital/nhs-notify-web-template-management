import type { RoutingConfig, RoutingConfigSuccess } from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';

export class RoutingConfigurationApiClient {
  private readonly httpClient = createAxiosClient();

  async get(token: string, id: string): Promise<Result<RoutingConfig>> {
    const url = `/v1/routing-configuration/${id}`;

    const { data, error } = await catchAxiosError(
      this.httpClient.get<RoutingConfigSuccess>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }

  async update(
    token: string,
    id: string,
    routingConfig: RoutingConfig
  ): Promise<Result<RoutingConfig>> {
    const url = `/v1/routing-configuration/${id}`;

    const { data, error } = await catchAxiosError(
      this.httpClient.put<RoutingConfigSuccess>(url, routingConfig, {
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
