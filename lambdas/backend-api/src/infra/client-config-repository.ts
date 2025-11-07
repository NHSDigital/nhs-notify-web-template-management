import { z } from 'zod/v4';
import NodeCache from 'node-cache';
import {
  GetParameterCommand,
  ParameterNotFound,
  SSMClient,
} from '@aws-sdk/client-ssm';
import {
  ClientConfiguration,
  $ClientConfiguration,
  ErrorCase,
} from 'nhs-notify-backend-client';
import { parseJsonPreprocessor } from '@backend-api/utils/zod-json-preprocessor';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';

const $ClientProcessed = z.preprocess(
  parseJsonPreprocessor,
  $ClientConfiguration
);

export class ClientConfigRepository {
  constructor(
    private readonly ssmKeyPrefix: string,
    private readonly ssmClient: SSMClient,
    private readonly cache: NodeCache
  ) {}

  async get(
    clientId: string
  ): Promise<ApplicationResult<ClientConfiguration | null>> {
    const key = `${this.ssmKeyPrefix}/${clientId}`;

    const cached = this.cache.get<ClientConfiguration | null>(key);

    if (cached === null) return success(null);
    if (cached) return success(cached);

    let client: string | undefined;

    try {
      const response = await this.ssmClient.send(
        new GetParameterCommand({
          Name: key,
        })
      );
      client = response.Parameter?.Value;
    } catch (error) {
      if (error instanceof ParameterNotFound) {
        this.cache.set<ClientConfiguration | null>(key, null);
        return success(null);
      }

      return failure(
        ErrorCase.INTERNAL,
        'Failed to fetch client configuration',
        error
      );
    }

    const { data, error } = $ClientProcessed.safeParse(client);

    if (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Client configuration is invalid',
        error
      );
    }

    this.cache.set<ClientConfiguration>(key, data);

    return success(data);
  }
}
