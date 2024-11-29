import { z } from 'zod';
import {
  CreateTemplateInput,
  TemplateStatus,
  TemplateType,
  UpdateTemplateInput,
} from 'nhs-notify-backend-client';
import { schemaFor } from '@backend-api/utils/schema-for';

const $Template = schemaFor<CreateTemplateInput>()(
  z.object({
    type: z.enum([TemplateType.LETTER, TemplateType.SMS, TemplateType.NHS_APP]),
    name: z.string(),
    message: z.string(),
  })
);

const $EmailTemplate = schemaFor<CreateTemplateInput>()(
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
  schemaFor<UpdateTemplateInput>()(
    $EmailTemplate.extend({
      id: z.string(),
      status: z.nativeEnum(TemplateStatus),
    })
  ),
  schemaFor<UpdateTemplateInput>()(
    $Template.extend({
      id: z.string(),
      status: z.nativeEnum(TemplateStatus),
    })
  ),
]);
