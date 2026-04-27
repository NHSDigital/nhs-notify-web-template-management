import { SSMClient } from '@aws-sdk/client-ssm';
import { ClientConfigRepository } from '@backend-api/infra/client-config-repository';
import { Config } from '@backend-api/infra/config';
import NodeCache from 'node-cache';

const awsConfig = { region: 'eu-west-2' };

export const clientConfigContainer = (config: Config) => {
  const ssmClient = new SSMClient(awsConfig);

  const clientConfigRepo = new ClientConfigRepository(
    config.clientConfigSsmKeyPrefix,
    ssmClient,
    new NodeCache({ stdTTL: config.clientConfigTtlSeconds })
  );

  return { clientConfigRepo };
};
