import { createHash, randomUUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { PutCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ErrorCase } from 'nhs-notify-backend-client/types';
import type {
  ContactDetail,
  ContactDetailInputNormalized,
} from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { failure, success, type ApplicationResult } from '@backend-api/utils';

export class ContactDetailsRepository {
  constructor(
    private dynamodb: DynamoDBDocumentClient,
    private tableName: string,
    private unverifiedTtlSeconds: number
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
            PK: `CLIENT#${user.clientId}`,
            SK: this.getContactDetailKey(details),
            ...dto,
            rawValue: details.rawValue,
            otpHash: this.hashOtp(dto, otp),
            ttl: this.getUnverifiedTtl(now),
            createdAt: now.toISOString(),
            createdBy: `INTERNAL_USER#${user.internalUserId}`,
            updatedAt: now.toISOString(),
            updatedBy: `INTERNAL_USER#${user.internalUserId}`,
          },
          ExpressionAttributeNames: {
            '#pk': 'PK',
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':statusVerified': 'VERIFIED',
          },
          ConditionExpression:
            'attribute_not_exists(#pk) OR #status <> :statusVerified',
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

  private hashOtp(details: ContactDetail, otp: string) {
    return createHash('sha256')
      .update(details.id)
      .update(details.value)
      .update(otp)
      .digest()
      .toString('hex');
  }
}
