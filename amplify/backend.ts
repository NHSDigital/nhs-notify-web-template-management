/* eslint-disable sonarjs/no-commented-code */
import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { data } from './data/resource';
import { auth } from './auth/resource';
import { sendEmail } from './functions/send-email/resource';

const backend = defineBackend({
  data,
  auth,
  sendEmail,
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
/*
const userPoolId = process.env.USER_POOL_ID;
const userPoolClientId = process.env.USER_POOL_CLIENT_ID;
const hostedLoginDomain = `auth.${process.env.NOTIFY_DOMAIN_NAME}`;
const domainName = `${process.env.NOTIFY_ENVIRONMENT}.${process.env.NOTIFY_DOMAIN_NAME}`;

backend.addOutput({
  auth: {
    aws_region: 'eu-west-2',
    user_pool_id: userPoolId,
    user_pool_client_id: userPoolClientId,
    oauth: {
      identity_providers: [],
      domain: hostedLoginDomain,
      scopes: [
        'openid',
        'email',
        'profile',
        'phone',
        'aws.cognito.signin.user.admin',
      ],
      redirect_sign_in_uri: [
        `https://${domainName}/auth/`,
      ],
      redirect_sign_out_uri: [
        `https://${domainName}/`,
      ],
      response_type: 'code',
    },
    username_attributes: ['email'],
    standard_required_attributes: ['email'],
    user_verification_types: ['email'],
    unauthenticated_identities_enabled: false,
    password_policy: {
      min_length: 8,
      require_lowercase: true,
      require_uppercase: true,
      require_numbers: true,
      require_symbols: true,
    },
  },
});

backend.addOutput() */
