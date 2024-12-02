import { z } from 'zod';
import {
  CreateTemplate,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { schemaFor } from '@backend-api/utils/schema-for';
import {
  MAX_SMS_CHARACTER_LENGTH,
  MAX_EMAIL_CHARACTER_LENGTH,
  MAX_NHS_APP_CHARACTER_LENGTH,
  MAX_LETTER_CHARACTER_LENGTH,
  NHS_APP_DISALLOWED_CHARACTERS,
} from './constants';

const $Template = schemaFor<CreateTemplate>()(
  z.object({
    templateType: z.nativeEnum(TemplateType),
    name: z.string().min(1),
    message: z.string(),
  })
);

export const $SMSTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    templateType: z.literal(TemplateType.SMS),
    message: z.string().min(1).max(MAX_SMS_CHARACTER_LENGTH),
  })
);

export const $NhsAppTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    templateType: z.literal(TemplateType.NHS_APP),
    message: z
      .string()
      .min(1)
      .max(MAX_NHS_APP_CHARACTER_LENGTH)
      .refine((s) => !NHS_APP_DISALLOWED_CHARACTERS.test(s), {
        message: `NHS App template message contains disallowed characters. Disallowed characters: ${NHS_APP_DISALLOWED_CHARACTERS}`,
      }),
  })
);

export const $EmailTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    subject: z.string().min(1),
    templateType: z.literal(TemplateType.EMAIL),
    message: z.string().max(MAX_EMAIL_CHARACTER_LENGTH).min(1),
  })
);

export const $LetterTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    templateType: z.literal(TemplateType.LETTER),
    message: z.string().max(MAX_LETTER_CHARACTER_LENGTH).min(1),
  })
);

const $UpdateFields = {
  templateStatus: z.nativeEnum(TemplateStatus),
};

export const $CreateTemplateSchema = z.discriminatedUnion('templateType', [
  $SMSTemplate,
  $NhsAppTemplate,
  $EmailTemplate,
  $LetterTemplate,
]);

export const $UpdateTemplateSchema = schemaFor<UpdateTemplate>()(
  z.discriminatedUnion('templateType', [
    $SMSTemplate.extend($UpdateFields),
    $NhsAppTemplate.extend($UpdateFields),
    $EmailTemplate.extend($UpdateFields),
    $LetterTemplate.extend($UpdateFields),
  ])
);
