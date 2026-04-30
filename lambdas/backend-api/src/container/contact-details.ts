import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { VERSION } from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { ContactDetailsClient } from '@backend-api/app/contact-details-client';
import { ContactDetailEventBuilder } from '@backend-api/domain/contact-detail-event-builder';
import { loadConfig } from '@backend-api/infra/config';
import { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';
import { OtpService } from '@backend-api/infra/otp-service';

export function contactDetailsContainer() {
  const config = loadConfig();

  const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient(), {
    marshallOptions: { removeUndefinedValues: true },
  });

  const ssm = new SSMClient();

  const sns = new SNSClient();

  const repo = new ContactDetailsRepository(
    dynamodb,
    ssm,
    config.contactDetailsTableName,
    config.contactDetailsUnverifiedTtlSeconds,
    config.contactDetailsOtpSecretPath
  );

  const eventBuilder = new ContactDetailEventBuilder({
    version: VERSION,
    source: config.eventSource,
  });

  const otpService = new OtpService(eventBuilder, sns, config.eventTopicArn);

  return {
    contactDetailsClient: new ContactDetailsClient(repo, otpService),
  };
}
