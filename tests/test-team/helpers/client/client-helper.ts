import {
  DeleteParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

export type ClientConfiguration = {
  campaignId?: string;
  features: {
    proofing: boolean;
    // TODO: CCM-11148 Make routing flag required
    routing?: boolean;
  };
  name?: string;
};

export type ClientKey = `Client${1 | 2 | 3 | 4 | 5 | 6 | 'WithRoutingEnabled'}`;

type TestClients = Record<ClientKey, ClientConfiguration | undefined>;

export const testClients = {
  /**
   * Client1 has proofing enabled and routing disabled
   * This is the default client for the component tests.
   */
  Client1: {
    campaignId: 'Campaign1',
    name: 'NHS Test Client 1',
    features: {
      proofing: true,
      routing: false,
    },
  },
  /**
   * Client2 has proofing and routing disabled
   */
  Client2: {
    campaignId: 'Campaign2',
    name: 'NHS Test Client 2',
    features: {
      proofing: false,
      routing: false,
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
    campaignId: undefined,
    name: 'NHS Test Client 4',
    features: {
      proofing: true,
      routing: false,
    },
  },
  /**
   * Client5 is an alternate client to Client1
   * with proofing enabled
   */
  Client5: {
    campaignId: 'Campaign5',
    name: 'NHS Test Client 5',
    features: {
      proofing: true,
      routing: false,
    },
  },
  /**
   * Client6 has no client name set
   */
  Client6: {
    campaignId: 'Campaign6',
    features: {
      proofing: true,
      routing: false,
    },
  },
  ClientWithRoutingEnabled: {
    campaignId: 'Campaign7',
    name: 'NHS Test Client 7',
    features: {
      proofing: true,
      routing: true,
    },
  },
} satisfies TestClients;

export class ClientConfigurationHelper {
  private readonly ssmClient = new SSMClient({ region: 'eu-west-2' });

  constructor(
    private readonly clientSSMKeyPrefix: string,
    private readonly runId: string
  ) {}

  async setup() {
    return Promise.all(
      Object.entries(testClients).map(async ([clientKey, value]) => {
        const id = `${clientKey}--${this.runId}`;

        if (value !== undefined) {
          await this.ssmClient.send(
            new PutParameterCommand({
              Name: this.ssmKey(id),
              Value: JSON.stringify(value),
              Type: 'String',
              Overwrite: true,
            })
          );
        }
      })
    );
  }

  async teardown(ids: string[]) {
    if (ids.length > 0) {
      await this.ssmClient.send(
        new DeleteParametersCommand({
          Names: ids.map((id) => this.ssmKey(id)),
        })
      );
    }
  }

  private ssmKey(clientId: string) {
    return `${this.clientSSMKeyPrefix}/${clientId}`;
  }
}
