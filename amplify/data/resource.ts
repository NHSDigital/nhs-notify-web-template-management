import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  BackendSessionPOC: a
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
