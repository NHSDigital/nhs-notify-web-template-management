import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { RoutingConfigClient } from '../app/routing-config-client';
import { loadConfig } from '../infra/config';
import { RoutingConfigRepository } from '../infra/routing-config-repository';
import { clientConfigContainer } from './client-config';

const awsConfig = { region: 'eu-west-2' };

export const routingConfigContainer = () => {
  const config = loadConfig();

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient(awsConfig),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const { clientConfigRepo } = clientConfigContainer(config);

  const routingConfigRepository = new RoutingConfigRepository(
    ddbDocClient,
    config.routingConfigTableName,
    config.templatesTableName
  );

  const routingConfigClient = new RoutingConfigClient(
    routingConfigRepository,
    clientConfigRepo
  );

  return {
    routingConfigClient,
  };
};
