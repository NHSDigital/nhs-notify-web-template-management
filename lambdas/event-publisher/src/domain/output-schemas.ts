import { z } from 'zod';
import {
  $LetterFiles,
  TEMPLATE_STATUS_LIST,
  LANGUAGE_LIST,
  LETTER_TYPE_LIST,
} from 'nhs-notify-backend-client';

export const $EventType = z.enum([
  'uk.nhs.notify.template-management.TemplateSaved.v1',
]);
export type EventType = z.infer<typeof $EventType>;

export const $EventBase = z.object({
  id: z.string(),
  source: z.string(),
  specversion: z.literal('1.0'),
  type: $EventType,
  sequence: z.string().optional(),
  subject: z.string().optional(),
  time: z.string().optional(),
  datacontenttype: z.literal('application/json').optional(),
  dataschema: z.string().optional(),
});
export type EventBase = z.infer<typeof $EventBase>;

const $BaseDataFields = z.object({
  owner: z.string(),
  id: z.string(),
  clientId: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string(),
  name: z.string(),
  templateStatus: z.enum(TEMPLATE_STATUS_LIST),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

const $EmailDataFields = $BaseDataFields.merge(
  z.object({
    message: z.string(),
    subject: z.string(),
    templateType: z.literal('EMAIL'),
  })
);

const $NhsAppDataFields = $BaseDataFields.merge(
  z.object({
    message: z.string(),
    templateType: z.literal('NHS_APP'),
  })
);

const $LetterDataFields = $BaseDataFields.merge(
  z.object({
    files: $LetterFiles,
    templateType: z.literal('LETTER'),
    language: z.enum(LANGUAGE_LIST),
    letterType: z.enum(LETTER_TYPE_LIST),
  })
);

const $SmsDataFields = $BaseDataFields.merge(
  z.object({
    message: z.string(),
    templateType: z.literal('SMS'),
  })
);

export const $PreTransformationTemplateSavedDataFields = z.discriminatedUnion(
  'templateType',
  [$EmailDataFields, $NhsAppDataFields, $LetterDataFields, $SmsDataFields]
);
export type PreTransformationTemplateSavedDataFields = z.infer<
  typeof $PreTransformationTemplateSavedDataFields
>;

export const transformProofsObjectToSuppliersList = (
  input: PreTransformationTemplateSavedDataFields
) => {
  if (input.templateType !== 'LETTER') {
    return input;
  }
  const {
    files: { proofs },
    ...otherFields
  } = input;

  const suppliers: string[] = [];

  for (const { supplier } of Object.values(proofs ?? {})) {
    if (!suppliers.includes(supplier)) {
      suppliers.push(supplier);
    }
  }

  return {
    ...otherFields,
    suppliers,
  };
};

export const $TemplateSavedDataFields =
  $PreTransformationTemplateSavedDataFields.transform((input) =>
    transformProofsObjectToSuppliersList(input)
  );

export const $TemplateSavedEvent = $EventBase.merge(
  z.object({
    data: $TemplateSavedDataFields,
  })
);
export type TemplateSavedEvent = z.infer<typeof $TemplateSavedEvent>;

// the lambda doesn't necessarily have to only publish TemplateSaved events but
// that's all it is doing at the moment
export const $Event = $TemplateSavedEvent;
export type Event = z.infer<typeof $Event>;
