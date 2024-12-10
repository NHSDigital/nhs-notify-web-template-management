import axios from 'axios';
import { IFunctionsClient } from './types/functions-client';
import { Result } from './types/result';

type Failure = { technicalMessage: string };

export class FunctionsApiClient implements IFunctionsClient {
  private readonly _client;

  constructor(token: string) {
    this._client = axios.create({
      baseURL: process.env.BACKEND_API_URL,
      headers: {
        Authorization: token,
      },
      validateStatus: (_: number) => true, // Note: We don't want axios to throw an error when status code is not 2xx
    });
  }

  async sendEmail(templateId: string): Promise<Result<void>> {
    const response = await this._client.post<Failure>('/v1/email', {
      templateId,
    });

    if (response.status !== 200) {
      return {
        error: {
          code: response.status,
          message: response.data.technicalMessage,
        },
      };
    }
    return {
      data: undefined,
    };
  }
}
