import type { User } from 'nhs-notify-web-template-management-utils';
import type { LetterVariantRepository } from '@backend-api/infra/letter-variant-repository';
import {
  ErrorCase,
  type LetterVariant,
  type Result,
} from 'nhs-notify-backend-client';
import { failure, success } from '@backend-api/utils';

export class LetterVariantClient {
  constructor(private repo: LetterVariantRepository) {}

  async get(id: string, user: User): Promise<Result<LetterVariant>> {
    const result = await this.repo.getById(id);

    if (result.error) {
      return result;
    }

    const { data: variant } = result;

    if (variant.clientId && variant.clientId !== user.clientId) {
      return failure(ErrorCase.NOT_FOUND, 'Letter Variant not found');
    }

    return success(variant);
  }
}
