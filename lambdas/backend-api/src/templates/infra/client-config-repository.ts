import { z } from 'zod';
import NodeCache from 'node-cache';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { NotifyClient, $NotifyClient } from 'nhs-notify-backend-client';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { parseJsonPreprocessor } from '@backend-api/utils/zod-json-preprocessor';

const $NotifyClientProcessed = z.preprocess(
  parseJsonPreprocessor,
  $NotifyClient
);

export class ClientConfigRepository {
  constructor(
    private readonly ssmKeyPrefix: string,
    private readonly ssmClient: SSMClient,
    private readonly cache: NodeCache,
    private readonly logger: Logger
  ) {}

  async get(clientId: string): Promise<NotifyClient | undefined> {
    const key = `${this.ssmKeyPrefix}/${clientId}`;

    const notifyClient = this.cache.get<NotifyClient>(key);

    if (notifyClient) {
      return notifyClient;
    }

    const config = await this.ssmClient.send(
      new GetParameterCommand({
        Name: key,
      })
    );

    const { data, error, success } = $NotifyClientProcessed.safeParse(
      config.Parameter?.Value
    );

    if (!success) {
      this.logger.error('failed to obtain client configuration', error, {
        clientId,
      });
      return;
    }

    this.cache.set<NotifyClient>(key, data);

    return data;
  }
}
