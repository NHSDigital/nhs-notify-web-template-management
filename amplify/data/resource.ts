import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { sendEmail } from '../functions/send-email/resource';

const templateTypes = [
  TemplateType.NHS_APP,
  TemplateType.SMS,
  TemplateType.EMAIL,
  TemplateType.LETTER,
] as const;

const templateStatuses = [
  TemplateStatus.NOT_YET_SUBMITTED,
  TemplateStatus.SUBMITTED,
] as const;

const TemplateStorageModel = {
  id: a.string().required(),
  templateType: a.ref('TemplateType').required(),
  templateStatus: a.ref('TemplateStatus').required(),
  version: a.integer().required(),
  name: a.string().required(),
  subject: a.string(),
  message: a.string().required(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authPermission = (allow: any) =>
  process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true'
    ? [allow.authenticated()]
    : [allow.guest()];

const schema = a.schema({
  TemplateType: a.enum(templateTypes),
  TemplateStatus: a.enum(templateStatuses),
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
