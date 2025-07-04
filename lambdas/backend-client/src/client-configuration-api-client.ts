import { $ClientConfiguration } from './schemas/client';
import { ClientConfiguration } from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';

export class ClientConfigurationApiClient {
  private readonly httpClient = createAxiosClient();

  async fetch(token: string): Promise<ClientConfiguration | undefined> {
    const response = await catchAxiosError(
      this.httpClient.get<{ clientConfiguration: ClientConfiguration }>(
        `/v1/client-configuration`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      return undefined;
    }

    return $ClientConfiguration.parse(response.data.clientConfiguration);
  }
}

export const clientConfigurationApiClient = new ClientConfigurationApiClient();
