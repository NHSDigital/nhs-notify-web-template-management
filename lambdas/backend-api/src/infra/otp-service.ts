import { GetParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import { TOTP } from 'totp-generator';
import { failure, success, type ApplicationResult } from '@backend-api/utils';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import { ErrorCase } from 'nhs-notify-backend-client/types';

export class OtpService {
  constructor(
    private ssm: SSMClient,
    private otpSecretPath: string
  ) {}

  async generate(): Promise<ApplicationResult<string>> {
    try {
      const { Parameter } = await this.ssm.send(
        new GetParameterCommand({
          Name: this.otpSecretPath,
          WithDecryption: true,
        })
      );

      const secret = Parameter?.Value;

      if (!secret) {
        throw new Error('No secret returned from parameter store.');
      }

      const { otp } = await TOTP.generate(secret);

      return success(otp);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Unable to generate OTP', error);
    }
  }

  async send(
    details: ContactDetail,
    otp: string
  ): Promise<ApplicationResult<void>> {
    console.log(JSON.stringify({ ...details, otp }));

    return { data: undefined };
  }
}
