import { z } from 'zod';
import {
  CreateTemplate,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { schemaFor } from '@backend-api/utils/schema-for';

const $Template = schemaFor<CreateTemplate>()(
  z.object({
    type: z.enum([TemplateType.LETTER, TemplateType.SMS, TemplateType.NHS_APP]),
    name: z.string(),
    message: z.string(),
  })
).strict();

const $EmailTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    subject: z.string(),
    type: z.literal(TemplateType.EMAIL),
  })
).strict();

export const $CreateTemplateSchema = z.discriminatedUnion('type', [
  $EmailTemplate,
  $Template,
]);

export const $UpdateTemplateSchema = schemaFor<UpdateTemplate>()(
  z
    .object({
      status: z.nativeEnum(TemplateStatus),
      name: z.string(),
      message: z.string(),
      subject: z.string().optional(),
    })
    .strict()
);

// TODO: fix dynamoDB calls
// TODO: figure out API gateway only allowing 1 lambda being allowed to invoke!?
// TODO: rename type and status to templateType and templateStatus
// TODO: add base line validation I.E> only 9000 characters
// TODO: add cause for failure
