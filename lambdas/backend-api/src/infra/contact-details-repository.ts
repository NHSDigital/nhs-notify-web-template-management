import { randomUUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetParameterCommand, type SSMClient } from '@aws-sdk/client-ssm';
import { PutCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ErrorCase } from 'nhs-notify-backend-client/types';
import type {
  ContactDetail,
  ContactDetailInputNormalized,
  ContactDetailStatus,
} from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { hashContactDetailsOtp } from '@backend-api/domain/hash-contact-details-otp';
import { failure, success, type ApplicationResult } from '@backend-api/utils';

export class ContactDetailsRepository {
  private otpSecret: string | null = null;

  constructor(
    private dynamodb: DynamoDBDocumentClient,
    private ssm: SSMClient,
    private tableName: string,
    private unverifiedTtlSeconds: number,
    private otpSecretPath: string
  ) {}

  async putContactDetail(
    details: ContactDetailInputNormalized,
    otp: string,
    user: User
  ): Promise<ApplicationResult<ContactDetail>> {
    const dto: ContactDetail = {
      clientId: user.clientId,
      id: randomUUID(),
      status: 'PENDING_VERIFICATION',
      type: details.type,
      value: details.value,
    };

    const now = new Date();

    try {
      await this.dynamodb.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            owner: `CLIENT#${user.clientId}`,
            contactDetailKey: this.getContactDetailKey(details),
            ...dto,
            rawValue: details.rawValue,
            otpHash: await this.hashOtp(dto, otp),
            ttl: this.getUnverifiedTtl(now),
            createdAt: now.toISOString(),
            createdBy: `INTERNAL_USER#${user.internalUserId}`,
            updatedAt: now.toISOString(),
            updatedBy: `INTERNAL_USER#${user.internalUserId}`,
          },
          ExpressionAttributeNames: {
            '#owner': 'owner',
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':statusVerified': 'VERIFIED' satisfies ContactDetailStatus,
          },
          ConditionExpression:
            'attribute_not_exists(#owner) OR #status <> :statusVerified',
        })
      );

      return success(dto);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return failure(
          ErrorCase.CONFLICT,
          'Contact details already verified.',
          error
        );
      }

      return failure(
        ErrorCase.INTERNAL,
        'Failed to save contact details.',
        error
      );
    }
  }

  private getContactDetailKey(detail: ContactDetailInputNormalized) {
    return `${detail.type}#${detail.value}`;
  }

  private getUnverifiedTtl(now: Date) {
    return Math.floor(now.getTime() / 1000) + this.unverifiedTtlSeconds;
  }

  private async getOtpSecret() {
    if (this.otpSecret) {
      return this.otpSecret;
    }

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

    this.otpSecret = secret;

    return secret;
  }

  private async hashOtp(details: ContactDetail, otp: string) {
    const secret = await this.getOtpSecret();

    return hashContactDetailsOtp(details, otp, secret);
  }
}
