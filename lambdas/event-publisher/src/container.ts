import { SNSClient } from '@aws-sdk/client-sns';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { App } from './app/app';
import { loadConfig } from './config';
import { EventBuilder } from './domain/event-builder';
import { SNSRepository } from './infra/sns-repository';

export const createContainer = () => {
  const {
    EVENT_SOURCE,
    ROUTING_CONFIG_TABLE_NAME,
    SNS_TOPIC_ARN,
    TEMPLATES_TABLE_NAME,
  } = loadConfig();

  const snsClient = new SNSClient({ region: 'eu-west-2' });

  const snsRepository = new SNSRepository(snsClient, SNS_TOPIC_ARN);

  const eventBuilder = new EventBuilder(
    TEMPLATES_TABLE_NAME,
    ROUTING_CONFIG_TABLE_NAME,
    EVENT_SOURCE,
    logger
  );

  const app = new App(snsRepository, eventBuilder, logger);

  return {
    app,
  };
};
