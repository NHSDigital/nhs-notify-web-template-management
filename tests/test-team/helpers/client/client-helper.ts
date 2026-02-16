import {
  DeleteParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import type { AuthContextFile } from 'helpers/auth/auth-context-file';

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

  constructor(
    private readonly clientSSMKeyPrefix: string,
    private readonly runId: string,
    private authContextFile: AuthContextFile
  ) {}

  async setup() {
    return Promise.all(
      Object.entries(testClients).map(async ([clientKey, value]) => {
        if (value !== undefined) {
          await this.createClient(
            this.clientIdFromKey(clientKey as ClientKey),
            value
          );
        }
      })
    );
  }

  async teardown() {
    const values = await this.authContextFile.clientValues(this.runId);
    const ids = Object.keys(values);

    if (ids.length > 0) {
      await this.ssmClient.send(
        new DeleteParametersCommand({
          Names: ids.map((id) => this.ssmKey(id)),
        })
      );
    }
  }

  async createClient(id: string, value: ClientConfiguration) {
    await this.ssmClient.send(
      new PutParameterCommand({
        Name: this.ssmKey(id),
        Value: JSON.stringify(value),
        Type: 'String',
        Overwrite: true,
      })
    );

    await this.authContextFile.setClient(this.runId, id, value);
  }

  getClient(clientId: string) {
    return this.authContextFile.getClient(this.runId, clientId);
  }

  clientIdFromKey(clientKey: ClientKey) {
    return `${clientKey}--${this.runId}`;
  }

  private ssmKey(clientId: string) {
    return `${this.clientSSMKeyPrefix}/${clientId}`;
  }
}
