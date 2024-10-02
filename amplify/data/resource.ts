import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sendEmail } from '../functions/send-email/resource';

const templateTypes = ['NHS_APP', 'SMS', 'EMAIL', 'LETTER'] as const;

const SessionStorageModel = {
  id: a.string().required(),
  templateType: a.enum([...templateTypes, 'UNKNOWN']),
  nhsAppTemplateName: a.string().required(),
  nhsAppTemplateMessage: a.string().required(),
  ttl: a.integer(),
};

const TemplateStorageModel = {
  id: a.string().required(),
  name: a.string().required(),
  type: a.enum(templateTypes),
  version: a.integer().required(),
  fields: a.customType({
    content: a.string().required(),
  }),
};

const schema = a.schema({
  SessionStorage: a
    .model(SessionStorageModel)
    .authorization((allow) => [allow.guest()]),
  TemplateStorage: a
    .model(TemplateStorageModel)
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
