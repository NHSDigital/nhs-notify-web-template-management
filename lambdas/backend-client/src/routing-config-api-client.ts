import { z } from 'zod/v4';
import type {
  CountSuccess,
  GetV1RoutingConfigurationsCountData,
  GetV1RoutingConfigurationsData,
  RoutingConfig,
  RoutingConfigSuccess,
  RoutingConfigStatusActive,
  RoutingConfigSuccessList,
  PostV1RoutingConfigurationData,
  GetV1RoutingConfigurationByRoutingConfigIdData,
  PutV1RoutingConfigurationByRoutingConfigIdData,
  CreateUpdateRoutingConfig,
  PatchV1RoutingConfigurationByRoutingConfigIdSubmitData,
} from './types/generated';
import { ErrorCase } from './types/error-cases';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';
import { OpenApiToTemplate } from './types/open-api-helper';

export const httpClient = createAxiosClient();

function parseId(id: string): Result<string> {
  const { success, data } = z.uuidv4().safeParse(id);

  if (!success) {
    return {
      error: {
        errorMeta: {
          code: ErrorCase.VALIDATION_FAILED,
          description: 'Invalid routing configuration ID format',
          details: { id },
        },
      },
    };
  }

  return { data };
}

export const routingConfigurationApiClient = {
  async create(
    routingConfig: CreateUpdateRoutingConfig,
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

  async get(
    token: string,
    id: RoutingConfig['id']
  ): Promise<Result<RoutingConfig>> {
    const parseResult = parseId(id);

    if (parseResult.error) {
      return parseResult;
    }

    const url = `/v1/routing-configuration/${id}` satisfies OpenApiToTemplate<
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

  async update(
    token: string,
    id: RoutingConfig['id'],
    routingConfig: CreateUpdateRoutingConfig
  ): Promise<Result<RoutingConfig>> {
    const parseResult = parseId(id);

    if (parseResult.error) {
      return parseResult;
    }

    const url = `/v1/routing-configuration/${id}` satisfies OpenApiToTemplate<
      PutV1RoutingConfigurationByRoutingConfigIdData['url']
    >;

    const { data, error } = await catchAxiosError(
      httpClient.put<RoutingConfigSuccess>(url, routingConfig, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },

  async submit(id: string, token: string): Promise<Result<RoutingConfig>> {
    const parseResult = parseId(id);

    if (parseResult.error) {
      return parseResult;
    }

    const url =
      `/v1/routing-configuration/${parseResult.data}/submit` satisfies OpenApiToTemplate<
        PatchV1RoutingConfigurationByRoutingConfigIdSubmitData['url']
      >;

    const { error, data } = await catchAxiosError(
      httpClient.patch<RoutingConfigSuccess>(url, null, {
        headers: { Authorization: token },
      })
    );

    if (error) {
      return { error };
    }

    return { ...data };
  },
};
