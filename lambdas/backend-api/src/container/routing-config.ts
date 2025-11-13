import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import NodeCache from 'node-cache';
import { RoutingConfigClient } from '../app/routing-config-client';
import { loadConfig } from '../infra/config';
import { ClientConfigRepository } from '../infra/client-config-repository';
import { RoutingConfigRepository } from '../infra/routing-config-repository';

const awsConfig = { region: 'eu-west-2' };

export const routingConfigContainer = () => {
  const config = loadConfig();

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(awsConfig),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const ssmClient = new SSMClient(awsConfig);

  const clientConfigRepository = new ClientConfigRepository(
    config.clientConfigSsmKeyPrefix,
    ssmClient,
    new NodeCache({ stdTTL: config.clientConfigTtlSeconds })
  );

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config
  );

  const routingConfigClient = new RoutingConfigClient(
    routingConfigRepository,
    clientConfigRepository
  );

  return {
    routingConfigClient,
  };
};
