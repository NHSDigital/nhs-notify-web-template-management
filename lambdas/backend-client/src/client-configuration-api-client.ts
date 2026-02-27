import { $ClientConfiguration } from './schemas/client';
import type { ClientConfiguration } from 'nhs-notify-web-template-management-types';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';
import { ErrorCase } from './types/error-cases';

export const httpClient = createAxiosClient();

export const clientConfigurationApiClient = {
  async fetch(token: string): Promise<Result<ClientConfiguration | null>> {
    const response = await catchAxiosError(
      httpClient.get<{ clientConfiguration: ClientConfiguration }>(
        `/v1/client-configuration`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      if (response.error.errorMeta.code === 404) {
        return { data: null };
      }

      return { error: response.error };
    }

    const parseResult = $ClientConfiguration.safeParse(
      response.data.clientConfiguration
    );

    if (parseResult.error) {
      return {
        error: {
          errorMeta: {
            description: parseResult.error.message,
            code: ErrorCase.INTERNAL,
            details: parseResult.error.issues,
          },
        },
      };
    }

    return { data: parseResult.data };
  },
};
