import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { TemplateStorageModel } from './models/template-storage.model';

const SessionStorageModel = {
  id: a.string().required(),
  templateType: a.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER', 'UNKNOWN']),
  nhsAppTemplateName: a.string().required(),
  nhsAppTemplateMessage: a.string().required(),
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
