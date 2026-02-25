import { catchAxiosError, createAxiosClient } from './axios-client';
import { Result } from './types/result';
import { LetterVariant, LetterVariantSuccess } from './types/generated';

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
