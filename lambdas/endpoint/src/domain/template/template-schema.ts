import {
  CreateTemplateInput,
  TemplateStatus,
  TemplateType,
  UpdateTemplateInput,
} from 'nhs-notify-templates-client';
import { z } from 'zod';
import { schemaFor } from '../../utils/schema-for';

const $Template = schemaFor<CreateTemplateInput>()(
  z.object({
    type: z.nativeEnum(TemplateType),
    name: z.string(),
    message: z.string(),
  })
);

const $LetterTemplate = schemaFor<CreateTemplateInput>()(
  $Template.extend({
    subject: z.string(),
  })
);

export const $CreateTemplateSchema = z.discriminatedUnion('type', [
  $LetterTemplate,
  $Template,
]);

export const $UpdateTemplateSchema = z.discriminatedUnion('type', [
  schemaFor<UpdateTemplateInput>()(
    $LetterTemplate.extend({
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
