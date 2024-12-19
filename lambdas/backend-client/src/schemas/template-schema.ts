import { z } from 'zod';
import {
  CreateTemplate,
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { schemaFor } from './schema-for';
import {
  MAX_SMS_CHARACTER_LENGTH,
  MAX_EMAIL_CHARACTER_LENGTH,
  MAX_NHS_APP_CHARACTER_LENGTH,
  NHS_APP_DISALLOWED_CHARACTERS,
} from './constants';

const $Template = schemaFor<CreateTemplate>()(
  z.object({
    templateType: z.nativeEnum(TemplateType),
    name: z.string().trim().min(1),
    message: z.string().trim().min(1),
  })
);

export const $SMSTemplateFields = schemaFor<CreateTemplate>()(
  $Template.extend({
    templateType: z.literal(TemplateType.SMS),
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $NHSAppTemplateFields = schemaFor<CreateTemplate>()(
  $Template.extend({
    templateType: z.literal(TemplateType.NHS_APP),
    message: z
      .string()
      .trim()
      .min(1)
      .max(MAX_NHS_APP_CHARACTER_LENGTH)
      // eslint-disable-next-line security/detect-non-literal-regexp
      .refine((s) => !new RegExp(NHS_APP_DISALLOWED_CHARACTERS, 'gi').test(s), {
        message: `Message contains disallowed characters. Disallowed characters: ${NHS_APP_DISALLOWED_CHARACTERS}`,
      }),
  })
);

export const $EmailTemplateFields = schemaFor<CreateTemplate>()(
  $Template.extend({
    subject: z.string().trim().min(1),
    templateType: z.literal(TemplateType.EMAIL),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

export const $CreateTemplateSchema = z.discriminatedUnion('templateType', [
  $SMSTemplateFields,
  $NHSAppTemplateFields,
  $EmailTemplateFields,
]);

const $UpdateTemplateFields = {
  templateStatus: z.nativeEnum(TemplateStatus),
};

export const $UpdateTemplateSchema = schemaFor<UpdateTemplate>()(
  z.discriminatedUnion('templateType', [
    $SMSTemplateFields.extend($UpdateTemplateFields),
    $NHSAppTemplateFields.extend($UpdateTemplateFields),
    $EmailTemplateFields.extend($UpdateTemplateFields),
  ])
);

const $TemplateDTOFields = {
  id: z.string(),
  templateStatus: z.nativeEnum(TemplateStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
};

export const $SMSTemplateDTO = schemaFor<TemplateDTO>()(
  $SMSTemplateFields.extend($TemplateDTOFields)
);

export const $NHSAppTemplateDTO = schemaFor<TemplateDTO>()(
  $NHSAppTemplateFields.extend($TemplateDTOFields)
);

export const $EmailTemplateDTO = schemaFor<TemplateDTO>()(
  $EmailTemplateFields.extend($TemplateDTOFields)
);
