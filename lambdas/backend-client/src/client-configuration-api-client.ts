import { $ClientConfiguration } from './schemas/client';
import { ClientConfiguration } from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';
import { ErrorCase } from './types/error-cases';

export class ClientConfigurationApiClient {
  private readonly httpClient = createAxiosClient();

  async fetch(token: string): Promise<Result<ClientConfiguration | null>> {
    const response = await catchAxiosError(
      this.httpClient.get<{ clientConfiguration: ClientConfiguration }>(
        `/v1/client-configuration`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      if (response.error.code === 404) {
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
          message: parseResult.error.message,
          code: ErrorCase.INTERNAL,
          details: parseResult.error.issues,
        },
      };
    }

    return { data: parseResult.data };
  }
}

export const clientConfigurationApiClient = new ClientConfigurationApiClient();
