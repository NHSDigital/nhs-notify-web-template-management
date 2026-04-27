import { randomInt } from 'node:crypto';
import { type SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ErrorCase } from 'nhs-notify-backend-client/types';
import type { ContactDetail } from 'nhs-notify-web-template-management-types';
import type { ContactDetailEventBuilder } from '@backend-api/domain/contact-detail-event-builder';
import { failure, success, type ApplicationResult } from '@backend-api/utils';

export class OtpService {
  constructor(
    private eventBuilder: ContactDetailEventBuilder,
    private sns: SNSClient,
    private topicArn: string
  ) {}

  async generate(): Promise<ApplicationResult<string>> {
    try {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
      return success(otp);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Unable to generate OTP', error);
    }
  }

  async send(
    { status, ...detail }: ContactDetail,
    otp: string
  ): Promise<ApplicationResult<void>> {
    try {
      const event = this.eventBuilder.buildVerificationRequestedEvent({
        ...detail,
        otp,
      });

      await this.sns.send(
        new PublishCommand({
          TopicArn: this.topicArn,
          Message: JSON.stringify(event),
        })
      );

      return { data: undefined };
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Unable to publish event', error);
    }
  }
}
