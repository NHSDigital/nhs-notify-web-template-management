import type {
  LetterVariant,
  LetterVariantSuccess,
} from 'nhs-notify-web-template-management-types';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';

export const httpClient = createAxiosClient();

export const letterVariantApiClient = {
  async getLetterVariant(
    id: string,
    token: string
  ): Promise<Result<LetterVariant>> {
    const response = await catchAxiosError(
      httpClient.get<LetterVariantSuccess>(
        `/v1/letter-variant/${encodeURIComponent(id)}`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      return { error: response.error };
    }

    return { data: response.data.data };
  },
};
