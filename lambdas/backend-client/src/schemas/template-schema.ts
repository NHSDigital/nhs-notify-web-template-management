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

const $BaseCreateTemplateSchema = schemaFor<CreateTemplate>()(
  z.object({
    templateType: z.nativeEnum(TemplateType),
    name: z.string().trim().min(1),
    message: z.string().trim().min(1).optional(),
  })
);

export const $CreateSMSTemplateSchema = schemaFor<CreateTemplate>()(
  $BaseCreateTemplateSchema.extend({
    templateType: z.literal(TemplateType.SMS),
    message: z.string().trim().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $CreateNhsAppTemplateSchema = schemaFor<CreateTemplate>()(
  $BaseCreateTemplateSchema.extend({
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

export const $CreateEmailTemplateSchema = schemaFor<CreateTemplate>()(
  $BaseCreateTemplateSchema.extend({
    subject: z.string().trim().min(1),
    templateType: z.literal(TemplateType.EMAIL),
    message: z.string().trim().min(1).max(MAX_EMAIL_CHARACTER_LENGTH),
  })
);

export const $CreateTemplateSchema = z.discriminatedUnion('templateType', [
  $CreateSMSTemplateSchema,
  $CreateNhsAppTemplateSchema,
  $CreateEmailTemplateSchema,
]);

const $UpdateTemplateFields = {
  templateStatus: z.nativeEnum(TemplateStatus),
};

export const $UpdateTemplateSchema = schemaFor<UpdateTemplate>()(
  z.discriminatedUnion('templateType', [
    $CreateSMSTemplateSchema.extend($UpdateTemplateFields),
    $CreateNhsAppTemplateSchema.extend($UpdateTemplateFields),
    $CreateEmailTemplateSchema.extend($UpdateTemplateFields),
  ])
);

export const $TemplateDTOSchema = schemaFor<TemplateDTO>()(
  $BaseCreateTemplateSchema.extend({
    id: z.string(),
    templateStatus: z.nativeEnum(TemplateStatus),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
);
