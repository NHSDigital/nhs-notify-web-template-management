import { z } from 'zod';
import NodeCache from 'node-cache';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { Client, $Client } from 'nhs-notify-backend-client';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { parseJsonPreprocessor } from '@backend-api/utils/zod-json-preprocessor';

const $ClientProcessed = z.preprocess(parseJsonPreprocessor, $Client);

export class ClientConfigRepository {
  constructor(
    private readonly ssmKeyPrefix: string,
    private readonly ssmClient: SSMClient,
    private readonly cache: NodeCache,
    private readonly logger: Logger
  ) {}

  async get(clientId: string): Promise<Client | undefined> {
    const key = `${this.ssmKeyPrefix}/${clientId}`;

    const cached = this.cache.get<Client>(key);

    if (cached) return cached;

    let client: string | undefined;

    try {
      const response = await this.ssmClient.send(
        new GetParameterCommand({
          Name: key,
        })
      );
      client = response.Parameter?.Value;
    } catch (error) {
      this.logger.error('failed to obtain client configuration', {
        error,
        clientId,
        key,
      });
      return;
    }

    const { data, error, success } = $ClientProcessed.safeParse(client);

    if (!success) {
      this.logger.error('Failed to parse client configuration', error, {
        clientId,
      });
      return;
    }

    this.cache.set<Client>(key, data);

    return data;
  }
}
