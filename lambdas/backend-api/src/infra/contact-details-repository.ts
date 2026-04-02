import { createHash, randomUUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { PutCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type {
  ContactDetail,
  ContactDetailInputNormalized,
} from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { failure, success, type ApplicationResult } from '@backend-api/utils';
import { ErrorCase } from 'nhs-notify-backend-client/types';

function hash(data: string) {
  return createHash('sha256').update(data).digest().toString('hex');
}

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
      id: randomUUID(),
      type: details.type,
      value: details.value,
      status: 'PENDING_VERIFICATION',
    };

    try {
      await this.dynamodb.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            PK: `CLIENT#${user.clientId}`,
            SK: this.getContactDetailKey(details),
            ...dto,
            rawValue: details.rawValue,
            otpHash: hash(otp),
            ttl: this.getUnverifiedTtl(),
            createdAt: new Date().toISOString(),
            createdBy: user.internalUserId,
            updatedAt: new Date().toISOString(),
            updatedBy: user.internalUserId,
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
        'Failed to save contact details',
        error
      );
    }
  }

  private getContactDetailKey(detail: ContactDetailInputNormalized) {
    return `${detail.type}#${hash(detail.value)}`;
  }

  private getUnverifiedTtl() {
    return Date.now() / 1000 + this.unverifiedTtlSeconds;
  }
}
