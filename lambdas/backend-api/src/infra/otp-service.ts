import { randomInt } from 'node:crypto';
import { ErrorCase } from 'nhs-notify-backend-client/types';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { failure, success, type ApplicationResult } from '@backend-api/utils';

export class OtpService {
  constructor(private logger: Logger) {}

  async generate(): Promise<ApplicationResult<string>> {
    try {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
      return success(otp);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Unable to generate OTP', error);
    }
  }

  async send(
    { value, ...details }: ContactDetail,
    _otp: string
  ): Promise<ApplicationResult<void>> {
    this.logger.info({ description: 'Fake sending OTP', details });

    return { data: undefined };
  }
}
