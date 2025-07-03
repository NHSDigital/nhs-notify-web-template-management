import {
  DeleteParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

type ClientConfiguration = {
  features: {
    proofing: boolean;
  };
  campaignId?: string;
};

export type ClientKey = `Client${1 | 2}`;

export const testClients: Record<ClientKey, ClientConfiguration> = {
  /**
   * Client1 has proofing enabled
   */
  Client1: {
    campaignId: 'Campaign1',
    features: {
      proofing: true,
    },
  },
  /**
   * Client2 has proofing disabled
   */
  Client2: {
    campaignId: 'Campaign2',
    features: {
      proofing: false,
    },
  },
};

export class ClientConfigurationHelper {
  private readonly ssmClient = new SSMClient({ region: 'eu-west-2' });

  constructor(
    private readonly clientSSMKeyPrefix: string,
    private readonly runId: string
  ) {}

  async createClient(clientKey: ClientKey) {
    const client = testClients[clientKey];

    const id = `${clientKey}--${this.runId}`;

    await this.ssmClient.send(
      new PutParameterCommand({
        Name: this.ssmKey(id),
        Value: JSON.stringify(client),
        Type: 'String',
        Overwrite: true,
      })
    );
  }

  async deleteClients(ids: string[]) {
    await this.ssmClient.send(
      new DeleteParametersCommand({
        Names: ids.map((id) => this.ssmKey(id)),
      })
    );
  }

  private ssmKey(clientId: string) {
    return `${this.clientSSMKeyPrefix}/${clientId}`;
  }
}
