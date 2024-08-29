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

const sendEmailLambda = backend.sendEmail.resources.lambda;

const attachPolicy = new PolicyStatement({
  sid: 'AmplifySendEmail',
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail'],
  resources: [
    'arn:aws:ses:eu-west-2:637423498933:identity/england.test.cm@nhs.net',
  ],
});

sendEmailLambda.addToRolePolicy(attachPolicy);
