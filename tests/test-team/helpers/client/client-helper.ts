import {
  DeleteParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import type { TestContextFile } from 'helpers/context/context-file';
import { chunk } from 'helpers/chunk';

export type ClientConfiguration = {
  campaignIds?: string[];
  features: {
    proofing: boolean;
    routing?: boolean;
    letterAuthoring?: boolean;
    digitalProofingNhsApp?: boolean;
    digitalProofingEmail?: boolean;
    digitalProofingSms?: boolean;
  };
  name?: string;
};

export type ClientConfigurationWithId = ClientConfiguration & {
  id: string;
};

export type ClientKey =
  `Client${1 | 2 | 3 | 4 | 5 | 6 | 'WithMultipleCampaigns' | 'RoutingEnabled' | 'LetterAuthoringEnabled' | 'DigitalProofingEnabled'}`;

export const testClients: Record<ClientKey, ClientConfiguration | undefined> = {
  /**
   * Client1 has proofing and routing enabled
   * This is the default client for the component tests.
   */
  Client1: {
    campaignIds: ['Campaign1'],
    name: 'NHS Test Client 1',
    features: {
      proofing: true,
      routing: true,
      letterAuthoring: false,
    },
  },
  /**
   * Client2 has all feature flags disabled
   */
  Client2: {
    campaignIds: ['Campaign2'],
    name: 'NHS Test Client 2',
    features: {
      proofing: false,
      routing: false,
      letterAuthoring: false,
    },
  },
  /**
   * Client3 has no configuration
   */
  Client3: undefined,
  /**
   * Client 4 has configuration but no campaignId set
   */
  Client4: {
    name: 'NHS Test Client 4',
    features: {
      proofing: true,
      routing: true,
      letterAuthoring: true,
    },
  },
  /**
   * Client5 is an alternate client to Client1
   * with proofing enabled
   */
  Client5: {
    campaignIds: ['Campaign5'],
    name: 'NHS Test Client 5',
    features: {
      proofing: true,
      routing: false,
      letterAuthoring: false,
    },
  },
  /**
   * Client6 has no client name set
   */
  Client6: {
    campaignIds: ['Campaign6'],
    features: {
      proofing: true,
      routing: false,
      letterAuthoring: false,
    },
  },

  ClientWithMultipleCampaigns: {
    campaignIds: ['campaign-id', 'other-campaign-id'],
    features: {
      proofing: true,
      routing: true,
      letterAuthoring: true,
    },
  },

  /**
   * ClientRoutingEnabled is an alternative client with routing enabled
   */
  ClientRoutingEnabled: {
    campaignIds: ['RoutingEnabledCampaign'],
    name: 'Routing Enabled Client',
    features: {
      proofing: false,
      routing: true,
      letterAuthoring: false,
    },
  },

  /**
   * ClientLetterAuthoringEnabled is an alternative client with letter authoring enabled
   */
  ClientLetterAuthoringEnabled: {
    campaignIds: ['LetterAuthoringEnabledCampaign'],
    name: 'Letter Authoring Enabled Client',
    features: {
      proofing: false,
      routing: true,
      letterAuthoring: true,
    },
  },

  /**
   * ClientDigitalProofingEnabled is an alternative client with all digital proofing flags enabled
   */
  ClientDigitalProofingEnabled: {
    campaignIds: ['DigitalProofingEnabledCampaign'],
    name: 'Digital Proofing Enabled Client',
    features: {
      proofing: false,
      routing: true,
      letterAuthoring: true,
      digitalProofingNhsApp: true,
      digitalProofingEmail: true,
      digitalProofingSms: true,
    },
  },
};

export class ClientConfigurationHelper {
  private readonly ssmClient = new SSMClient({
    region: 'eu-west-2',
    retryMode: 'standard',
    maxAttempts: 10,
  });

  constructor(private authContextFile: TestContextFile) {}

  static clientIdFromKey(clientKey: ClientKey) {
    return `${clientKey}--${process.env.PLAYWRIGHT_RUN_ID}`;
  }

  async setup() {
    return Promise.all(
      Object.entries(testClients).map(async ([clientKey, value]) => {
        if (value !== undefined) {
          await this.putClient(
            ClientConfigurationHelper.clientIdFromKey(clientKey as ClientKey),
            value
          );
        }
      })
    );
  }

  async teardown() {
    const ids = await this.authContextFile.getAllClientIds();

    if (ids.length > 0) {
      await Promise.all(
        chunk(ids, 10).map((batch) =>
          this.ssmClient.send(
            new DeleteParametersCommand({
              Names: batch.map((id) => this.ssmKey(id)),
            })
          )
        )
      );
    }
  }

  async createClient(value: ClientConfiguration) {
    const id = crypto.randomUUID();

    await this.putClient(id, value);

    return id;
  }

  async getClient(clientId: string) {
    const client = await this.authContextFile.getClient(clientId);

    if (client === null) {
      throw new Error(`Client "${clientId}" not found`);
    }

    return { ...client, id: clientId };
  }

  public async getStaticClient(clientKey: ClientKey) {
    const id = ClientConfigurationHelper.clientIdFromKey(clientKey);
    return this.getClient(id);
  }

  private async putClient(id: string, value: ClientConfiguration) {
    await this.ssmClient.send(
      new PutParameterCommand({
        Name: this.ssmKey(id),
        Value: JSON.stringify(value),
        Type: 'String',
        Overwrite: true,
      })
    );

    await this.authContextFile.setClient(id, value);
  }

  private ssmKey(clientId: string) {
    return `${process.env.CLIENT_SSM_PATH_PREFIX}/${clientId}`;
  }
}
