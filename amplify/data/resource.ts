import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  SessionStorage: a
    .model({
      sessionId: a.string(),
    })
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
