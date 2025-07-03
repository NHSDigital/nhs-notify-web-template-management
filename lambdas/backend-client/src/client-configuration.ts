import type { NotifyClient, Features } from './types/client';
import { $NotifyClient } from './schemas/client';

export class ClientConfiguration implements NotifyClient {
  constructor(
    public readonly features: Readonly<Features>,
    public readonly campaignId?: string
  ) {}

  featureEnabled(feature: keyof Features) {
    return this.features[feature];
  }

  static async fetch(token: string): Promise<ClientConfiguration | undefined> {
    const client = await ClientConfiguration._fetch(token);

    return new ClientConfiguration(client.features, client.campaignId);
  }

  private static async _fetch(_: string): Promise<NotifyClient> {
    return $NotifyClient.parse({
      clientId: 'example-clientId',
      campaignId: 'example-campaignId',
      name: 'example-name',
      features: {
        proofing: true,
      },
    });
  }
}
