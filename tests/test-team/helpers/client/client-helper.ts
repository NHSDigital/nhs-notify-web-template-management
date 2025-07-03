import {
  DeleteParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { TestSuite } from '../types';

type ClientConfiguration = {
  clientId: string; // Just to map to the the user's ClientId
  features: {
    proofing: boolean;
  };
  campaignId?: string;
};

export const testClients = {
  /**
   * Client1 has proofing enabled and a campaignId
   */
  Client1: {
    clientId: 'Client1',
    campaignId: 'Campaign1',
    features: {
      proofing: true,
    },
  },
  /**
   * Client2 has proofing enabled and no campaignId
   */
  Client2: {
    clientId: 'Client2',
    features: {
      proofing: true,
    },
  },
  /**
   * Client3 has proofing disabled and a campaignId
   */
  Client3: {
    clientId: 'Client3',
    campaignId: 'Campaign3',
    features: {
      proofing: false,
    },
  },
  /**
   * Client4 has proofing disabled and no campaignId
   */
  Client4: {
    clientId: 'Client4',
    features: {
      proofing: false,
    },
  },
} as const satisfies Record<string, ClientConfiguration>;

export class ClientConfigurationHelper {
  private readonly ssmClient = new SSMClient({ region: 'eu-west-2' });

  constructor(public readonly clientSSMKeyPrefix: string) {}

  public async setup(suite: TestSuite) {
    await Promise.all(
      Object.values(testClients).map((clientDetails) =>
        this.createClient(clientDetails, suite)
      )
    );
  }

  public async teardown(suite: TestSuite) {
    const keys = Object.values(testClients).map(({ clientId }) =>
      this.key(clientId, suite)
    );

    await this.deleteClient(keys);
  }

  private async createClient(config: ClientConfiguration, suite: TestSuite) {
    await this.ssmClient.send(
      new PutParameterCommand({
        Name: this.key(config.clientId, suite),
        Value: JSON.stringify(config),
        Type: 'String',
        Overwrite: true,
      })
    );
  }

  private async deleteClient(keys: string[]) {
    await this.ssmClient.send(
      new DeleteParametersCommand({
        Names: keys,
      })
    );
  }

  private key(clientId: string, suite: TestSuite) {
    return `${this.clientSSMKeyPrefix}/${clientId}-${suite}`;
  }
}

export function createClientHelper() {
  return new ClientConfigurationHelper(process.env.CLIENT_SSM_PATH_PREFIX);
}
