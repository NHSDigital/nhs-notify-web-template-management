import type {
  CountSuccess,
  GetV1RoutingConfigurationsCountData,
  GetV1RoutingConfigurationsData,
  RoutingConfig,
  RoutingConfigSuccess,
  RoutingConfigStatusActive,
  RoutingConfigSuccessList,
} from './types/generated';
import { ErrorCase } from './types/error-cases';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';

export function isValidUuid(id: string): boolean {
  return /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
    id
  );
}

export const axiosClient = createAxiosClient();

class RoutingConfigurationApiClient {
  async list(token: string): Promise<Result<RoutingConfig[]>> {
    const url =
      '/v1/routing-configurations' satisfies GetV1RoutingConfigurationsData['url'];

    const { data, error } = await catchAxiosError(
      axiosClient.get<RoutingConfigSuccessList>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }

  async count(
    token: string,
    status: RoutingConfigStatusActive
  ): Promise<Result<{ count: number }>> {
    const url =
      '/v1/routing-configurations/count' satisfies GetV1RoutingConfigurationsCountData['url'];

    const { data, error } = await catchAxiosError(
      axiosClient.get<CountSuccess>(url, {
        headers: { Authorization: token },
        params: { status },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }

  async get(token: string, id: string): Promise<Result<RoutingConfig>> {
    if (!isValidUuid(id)) {
      return {
        error: {
          errorMeta: {
            code: ErrorCase.VALIDATION_FAILED,
            description: 'Invalid routing configuration ID format',
            details: { id },
          },
          actualError: undefined,
        },
      };
    }
    const url = `/v1/routing-configuration/${id}`;

    const { data, error } = await catchAxiosError(
      axiosClient.get<RoutingConfigSuccess>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  }

  async create(
    routingConfig: Pick<
      RoutingConfig,
      'name' | 'campaignId' | 'cascade' | 'cascadeGroupOverrides'
    >,
    token: string
  ): Promise<Result<RoutingConfig>> {
    const response = await catchAxiosError(
      axiosClient.post<RoutingConfigSuccess>(
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
  }

  async update(
    token: string,
    id: string,
    routingConfig: RoutingConfig
  ): Promise<Result<RoutingConfig>> {
    if (!isValidUuid(id)) {
      return {
        error: {
          errorMeta: {
            code: ErrorCase.VALIDATION_FAILED,
            description: 'Invalid routing configuration ID format',
            details: { id },
          },
          actualError: undefined,
        },
      };
    }
    const url = `/v1/routing-configuration/${id}`;

    const { data, error } = await catchAxiosError(
      axiosClient.put<RoutingConfigSuccess>(url, routingConfig, {
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
