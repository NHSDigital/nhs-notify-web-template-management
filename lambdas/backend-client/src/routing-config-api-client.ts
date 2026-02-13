import type {
  CountSuccess,
  CreateRoutingConfig,
  GetV1RoutingConfigurationsCountData,
  GetV1RoutingConfigurationsData,
  GetV1RoutingConfigurationByRoutingConfigIdData,
  RoutingConfigReference,
  RoutingConfig,
  RoutingConfigSuccess,
  RoutingConfigSuccessList,
  PostV1RoutingConfigurationData,
  PatchV1RoutingConfigurationByRoutingConfigIdData,
  UpdateRoutingConfig,
} from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';
import { OpenApiToTemplate } from './types/open-api-helper';
import { RoutingConfigFilter } from './types/filters';

export const httpClient = createAxiosClient();

export const routingConfigurationApiClient = {
  async create(
    routingConfig: CreateRoutingConfig,
    token: string
  ): Promise<Result<RoutingConfig>> {
    const url =
      '/v1/routing-configuration' satisfies PostV1RoutingConfigurationData['url'];

    const response = await catchAxiosError(
      httpClient.post<RoutingConfigSuccess>(url, routingConfig, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
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
    filters?: RoutingConfigFilter
  ): Promise<Result<{ count: number }>> {
    const url =
      '/v1/routing-configurations/count' satisfies GetV1RoutingConfigurationsCountData['url'];

    const { data, error } = await catchAxiosError(
      httpClient.get<CountSuccess>(url, {
        headers: { Authorization: token },
        params: filters,
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async get(
    token: string,
    id: RoutingConfig['id']
  ): Promise<Result<RoutingConfig>> {
    const url =
      `/v1/routing-configuration/${encodeURIComponent(id)}` satisfies OpenApiToTemplate<
        GetV1RoutingConfigurationByRoutingConfigIdData['url']
      >;

    const { data, error } = await catchAxiosError(
      httpClient.get<RoutingConfigSuccess>(url, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async list(
    token: string,
    filters?: RoutingConfigFilter
  ): Promise<Result<RoutingConfig[]>> {
    const url =
      '/v1/routing-configurations' satisfies GetV1RoutingConfigurationsData['url'];

    const { data, error } = await catchAxiosError(
      httpClient.get<RoutingConfigSuccessList>(url, {
        headers: { Authorization: token },
        params: filters,
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async update(
    token: string,
    id: RoutingConfig['id'],
    routingConfig: UpdateRoutingConfig,
    lockNumber: number
  ): Promise<Result<RoutingConfig>> {
    const url =
      `/v1/routing-configuration/${encodeURIComponent(id)}` satisfies OpenApiToTemplate<
        PatchV1RoutingConfigurationByRoutingConfigIdData['url']
      >;

    const { data, error } = await catchAxiosError(
      httpClient.patch<RoutingConfigSuccess>(url, routingConfig, {
        headers: { Authorization: token, 'X-Lock-Number': String(lockNumber) },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async getRoutingConfigsByTemplateId(
    templateId: string,
    token: string
  ): Promise<Result<RoutingConfigReference[]>> {
    const { data, error } = await catchAxiosError(
      httpClient.get<{ data: RoutingConfigReference[] }>(
        `/v1/template/${encodeURIComponent(templateId)}/routing-configurations`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async submit(
    token: string,
    id: RoutingConfig['id'],
    lockNumber: number
  ): Promise<Result<RoutingConfig>> {
    const url = `/v1/routing-configuration/${encodeURIComponent(id)}/submit`;

    const { data, error } = await catchAxiosError(
      httpClient.patch<RoutingConfigSuccess>(
        url,
        {},
        {
          headers: {
            Authorization: token,
            'X-Lock-Number': String(lockNumber),
          },
        }
      )
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },
};
