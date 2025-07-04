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

export type ClientKey = `Client${1 | 2 | 3}`;

export const testClients: Record<ClientKey, ClientConfiguration | null> = {
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
  /**
   * Client3 has no configuration
   */
  Client3: null,
};

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

        if (value !== null) {
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
