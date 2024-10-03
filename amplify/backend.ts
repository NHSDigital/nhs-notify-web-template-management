/* eslint-disable sonarjs/no-commented-code */
import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendEmail } from './functions/send-email/resource';

const backend = defineBackend({
  auth,
  data,
  sendEmail,
});

const userPoolId = process.env.USER_POOL_ID;
const userPoolClientId = process.env.USER_POOL_CLIENT_ID;

backend.addOutput({
  auth: {
    user_pool_id: userPoolId,
    user_pool_client_id: userPoolClientId,
  },
});

const sendEmailLambda = backend.sendEmail.resources.lambda;

const attachPolicy = new PolicyStatement({
  sid: 'AmplifySendEmail',
  effect: Effect.ALLOW,
  actions: ['ses:SendRawEmail'],
  resources: [`arn:aws:ses:eu-west-2:${process.env.ACCOUNT_ID}:identity/*`],
});

sendEmailLambda.addToRolePolicy(attachPolicy);

backend.data.resources.cfnResources.amplifyDynamoDbTables.SessionStorage.timeToLiveAttribute =
  {
    attributeName: 'ttl',
    enabled: true,
  };
