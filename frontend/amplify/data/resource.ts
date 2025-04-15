import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const templateTypes = ['NHS_APP', 'SMS', 'EMAIL', 'LETTER'] as const;

const SessionStorageModel = {
  id: a.string().required(),
  templateType: a.enum([...templateTypes, 'UNKNOWN']),
  nhsAppTemplateName: a.string().required(),
  nhsAppTemplateMessage: a.string().required(),
  smsTemplateName: a.string(),
  smsTemplateMessage: a.string(),
  ttl: a.integer().required(),
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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
