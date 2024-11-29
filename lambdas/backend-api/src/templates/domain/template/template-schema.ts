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
);

const $EmailTemplate = schemaFor<CreateTemplate>()(
  $Template.extend({
    subject: z.string(),
    type: z.literal(TemplateType.EMAIL),
  })
);

export const $CreateTemplateSchema = z.discriminatedUnion('type', [
  $EmailTemplate,
  $Template,
]);

export const $UpdateTemplateSchema = z.discriminatedUnion('type', [
  schemaFor<UpdateTemplate>()(
    $EmailTemplate.extend({
      id: z.string(),
      status: z.nativeEnum(TemplateStatus),
    })
  ),
  schemaFor<UpdateTemplate>()(
    $Template.extend({
      id: z.string(),
      status: z.nativeEnum(TemplateStatus),
    })
  ),
]);
