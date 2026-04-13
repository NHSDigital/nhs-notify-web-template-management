import { SNSClient } from '@aws-sdk/client-sns';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { App } from './app/app';
import { loadConfig } from './config';
import { EventBuilder } from './domain/event-builder';
import { SNSRepository } from './infra/sns-repository';
import { SharedFileRepository } from './infra/shared-file-repository';
import { S3Client } from '@aws-sdk/client-s3';

export const createContainer = () => {
  const {
    EVENT_SOURCE,
    ROUTING_CONFIG_TABLE_NAME,
    SNS_TOPIC_ARN,
    TEMPLATES_TABLE_NAME,
    PROOF_REQUESTS_TABLE_NAME,
    INTERNAL_BUCKET_NAME,
    SHARED_FILES_BUCKET_NAME,
    SHARED_FILES_BUCKET_PREFIX,
  } = loadConfig();

  const snsClient = new SNSClient({ region: 'eu-west-2' });
  const s3Client = new S3Client();

  const snsRepository = new SNSRepository(snsClient, SNS_TOPIC_ARN);

  const eventBuilder = new EventBuilder(
    TEMPLATES_TABLE_NAME,
    ROUTING_CONFIG_TABLE_NAME,
    PROOF_REQUESTS_TABLE_NAME,
    EVENT_SOURCE,
    logger
  );

  const sharedFileRepository = new SharedFileRepository(
    s3Client,
    INTERNAL_BUCKET_NAME,
    SHARED_FILES_BUCKET_NAME,
    SHARED_FILES_BUCKET_PREFIX
  );

  const app = new App(
    snsRepository,
    eventBuilder,
    sharedFileRepository,
    logger
  );

  return {
    app,
  };
};
