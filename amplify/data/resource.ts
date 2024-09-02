import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sendEmail } from '../functions/send-email/resource';

const schema = a.schema({
  SessionStorage: a
    .model({
      id: a.string().required(),
      templateType: a.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER', 'UNKNOWN']),
      nhsAppTemplateName: a.string().required(),
      nhsAppTemplateMessage: a.string().required(),
    })
    .authorization((allow) => [allow.guest()]),
  sendEmail: a
    .query()
    .arguments({
      recipientEmail: a.string().required(),
      templateId: a.string().required(),
      templateName: a.string().required(),
      templateMessage: a.string().required(),
    })
    .returns(a.string())
    .handler(a.handler.function(sendEmail))
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
