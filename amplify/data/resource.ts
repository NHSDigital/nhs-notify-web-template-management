import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sendEmail } from '../functions/send-email/resource';

const templateTypes = ['NHS_APP', 'SMS', 'EMAIL', 'LETTER'] as const;

const TemplateStorageModel = {
  id: a.string().required(),
  templateType: a.enum([...templateTypes, 'UNKNOWN']),
  version: a.integer().required(),

  NHS_APP: a.customType({
    name: a.string().required(),
    message: a.string().required(),
  }),
  EMAIL: a.customType({
    name: a.string().required(),
    subject: a.string().required(),
    message: a.string().required(),
  }),
  SMS: a.customType({
    name: a.string().required(),
    message: a.string().required(),
  }),
  ttl: a.integer(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authPermission = (allow: any) =>
  process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true'
    ? [allow.authenticated()]
    : [allow.guest()];

const schema = a.schema({
  TemplateStorage: a.model(TemplateStorageModel).authorization(authPermission),
  sendEmail: a
    .query()
    .arguments({
      recipientEmail: a.string().required(),
      templateId: a.string().required(),
      templateName: a.string().required(),
      templateMessage: a.string().required(),
      templateSubjectLine: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(sendEmail))
    .authorization(authPermission),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
