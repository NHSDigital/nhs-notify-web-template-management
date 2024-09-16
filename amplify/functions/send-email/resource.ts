import { defineFunction } from '@aws-amplify/backend';

export const sendEmail = defineFunction({
  name: 'sendEmail',
  entry: './handler.ts',
  environment: {
    NOTIFY_DOMAIN_NAME: process.env.NOTIFY_DOMAIN_NAME ?? 'no-domain',
    ACCOUNT_ID: process.env.ACCOUNT_ID ?? 'no-account-id',
  },
});
