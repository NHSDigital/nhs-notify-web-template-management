import { randomInt } from 'node:crypto';
import { failure, success, type ApplicationResult } from '@backend-api/utils';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import { ErrorCase } from 'nhs-notify-backend-client/types';

export class OtpService {
  async generate(): Promise<ApplicationResult<string>> {
    try {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
      return success(otp);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Unable to generate OTP', error);
    }
  }

  async send(
    details: ContactDetail,
    _otp: string
  ): Promise<ApplicationResult<void>> {
    console.log({ id: details.id });

    return { data: undefined };
  }
}
