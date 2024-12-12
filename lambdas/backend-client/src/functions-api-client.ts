import { IFunctionsClient } from './types/functions-client';
import { Result } from './types/result';
import {
  AxiosRetryClient,
  catchAxiosError,
  createAxiosClient,
} from './axios-client';

type Failure = { technicalMessage: string };

export class FunctionsApiClient implements IFunctionsClient {
  private readonly _client: AxiosRetryClient;

  constructor(token: string) {
    this._client = createAxiosClient(token);
  }

  async sendEmail(templateId: string): Promise<Result<void>> {
    const response = await catchAxiosError(
      this._client.post<Failure>('/v1/email', {
        templateId,
      })
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: undefined,
    };
  }
}
