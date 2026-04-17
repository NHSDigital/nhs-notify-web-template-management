import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { ContactDetailsClient } from '@backend-api/app/contact-details-client';
import { clientConfigContainer } from '@backend-api/container/client-config';
import { loadConfig } from '@backend-api/infra/config';
import { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';
import { OtpService } from '@backend-api/infra/otp-service';

export function contactDetailsContainer() {
  const config = loadConfig();

  const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient(), {
    marshallOptions: { removeUndefinedValues: true },
  });

  const ssm = new SSMClient();

  const repo = new ContactDetailsRepository(
    dynamodb,
    ssm,
    config.contactDetailsTableName,
    config.contactDetailsUnverifiedTtlSeconds,
    config.contactDetailsOtpSecretPath
  );

  const otpService = new OtpService(logger);

  const { clientConfigRepo } = clientConfigContainer(config);

  return {
    contactDetailsClient: new ContactDetailsClient(
      repo,
      otpService,
      clientConfigRepo
    ),
  };
}
