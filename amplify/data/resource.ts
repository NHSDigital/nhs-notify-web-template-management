import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sendEmail } from '../functions/send-email/resource';

const templateTypes = ['NHS_APP', 'SMS', 'EMAIL', 'LETTER'] as const;

const SessionStorageModel = {
  id: a.string().required(),
  templateType: a.enum([...templateTypes, 'UNKNOWN']),
  nhsAppTemplateName: a.string().required(),
  nhsAppTemplateMessage: a.string().required(),
  emailTemplateName: a.string(),
  emailTemplateSubjectLine: a.string(),
  emailTemplateMessage: a.string(),
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
    subjectLine: a.string(),
    content: a.string().required(),
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authPermission = (allow: any) =>
  process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true'
    ? [allow.authenticated()]
    : [allow.guest()];

const schema = a.schema({
  SessionStorage: a.model(SessionStorageModel).authorization(authPermission),
  TemplateStorage: a.model(TemplateStorageModel).authorization(authPermission),
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
    .authorization(authPermission),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
