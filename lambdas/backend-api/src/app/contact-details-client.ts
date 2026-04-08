import { $ContactDetailInputNormalized } from 'nhs-notify-backend-client/schemas';
import { ErrorCase, type Result } from 'nhs-notify-backend-client/types';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import type { ClientConfigRepository } from '@backend-api/infra/client-config-repository';
import type { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';
import type { OtpService } from '@backend-api/infra/otp-service';
import { failure, validate } from '@backend-api/utils';

export class ContactDetailsClient {
  constructor(
    private contactDetailsRepo: ContactDetailsRepository,
    private otpService: OtpService,
    private clientConfigRepo: ClientConfigRepository
  ) {}

  async requestVerification(
    payload: unknown,
    user: User
  ): Promise<Result<ContactDetail>> {
    const validation = await validate($ContactDetailInputNormalized, payload);

    if (validation.error) return validation;

    const clientConfig = await this.clientConfigRepo.get(user.clientId);

    if (clientConfig.error) return clientConfig;

    if (
      (validation.data.type === 'EMAIL' &&
        !clientConfig.data?.features.digitalProofingEmail) ||
      (validation.data.type === 'SMS' &&
        !clientConfig.data?.features.digitalProofingSms)
    ) {
      return failure(
        ErrorCase.FEATURE_DISABLED,
        `User cannot request contact detail verification for ${validation.data.type}`
      );
    }

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
