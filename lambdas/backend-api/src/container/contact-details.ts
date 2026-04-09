import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
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

  const repo = new ContactDetailsRepository(
    dynamodb,
    config.contactDetailsTableName,
    config.contactDetailsUnverifiedTtlSeconds
  );

  const otpService = new OtpService();

  const { clientConfigRepo } = clientConfigContainer(config);

  return {
    contactDetailsClient: new ContactDetailsClient(
      repo,
      otpService,
      clientConfigRepo
    ),
  };
}
