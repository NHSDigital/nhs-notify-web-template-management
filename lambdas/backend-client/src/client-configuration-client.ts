import type {
  Features,
  IClientConfiguration,
} from './types/client-configuration';
import { $ClientConfiguration } from './schemas/client-configuration';

export class ClientConfiguration implements IClientConfiguration {
  private constructor(
    public readonly features: Readonly<Features>,
    public readonly campaignId?: string
  ) {}

  featureEnabled(feature: keyof Features) {
    return this.features[feature] === true;
  }

  /**
   * Gets and validates client configuration via AWS API gateway
   * @param {string} token user's JWT to authenticate against API gateway
   * @returns {Promise<ClientConfiguration>} client configuration.
   */
  static async fetch(token: string): Promise<ClientConfiguration | undefined> {
    const client = await ClientConfiguration._fetch(token);

    return new ClientConfiguration(client.features, client.campaignId);
  }

  // Note: Temporary until we have some sort of API.
  private static async _fetch(_: string): Promise<IClientConfiguration> {
    return $ClientConfiguration.parse({
      clientId: 'example-clientId',
      campaignId: 'example-campaignId',
      name: 'example-name',
      features: {
        proofing: true,
      },
    });
  }
}
