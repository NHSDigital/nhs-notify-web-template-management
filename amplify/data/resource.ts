import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  SessionStorage: a
    .model({
      id: a.string().required(),
      templateType: a.enum(['NHS_APP', 'SMS', 'EMAIL', 'LETTER', 'UNKNOWN']),
      nhsAppTemplateName: a.string().required(),
      nhsAppTemplateMessage: a.string().required(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
