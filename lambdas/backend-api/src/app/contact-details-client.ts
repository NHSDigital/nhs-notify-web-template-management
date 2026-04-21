import { $ContactDetailInputNormalized } from 'nhs-notify-backend-client/schemas';
import type { Result } from 'nhs-notify-backend-client/types';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import type { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';
import type { OtpService } from '@backend-api/infra/otp-service';
import { validate } from '@backend-api/utils';

export class ContactDetailsClient {
  constructor(
    private contactDetailsRepo: ContactDetailsRepository,
    private otpService: OtpService
  ) {}

  async requestVerification(
    payload: unknown,
    user: User
  ): Promise<Result<ContactDetail>> {
    const validation = await validate($ContactDetailInputNormalized, payload);

    if (validation.error) return validation;

    const otp = await this.otpService.generate();

    if (otp.error) return otp;

    const contactDetail = await this.contactDetailsRepo.putContactDetail(
      validation.data,
      otp.data,
      user
    );

    if (contactDetail.error) return contactDetail;

    const send = await this.otpService.send(contactDetail.data, otp.data);

    if (send.error) return send;

    return contactDetail;
  }
}
