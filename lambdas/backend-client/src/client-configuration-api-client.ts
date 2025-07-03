import { $Client } from './schemas/client';
import { Client } from './types/generated';
import { catchAxiosError, createAxiosClient } from './axios-client';

export class ClientConfigurationApiClient {
  private readonly httpClient = createAxiosClient();

  async fetch(token: string): Promise<Client | undefined> {
    const response = await catchAxiosError(
      this.httpClient.get<Client>(`/v1/client-configuration`, {
        headers: { Authorization: token },
      })
    );

    if (response.error) {
      return undefined;
    }

    return $Client.parse(response.data);
  }
}

export const clientConfigurationApiClient = new ClientConfigurationApiClient();
