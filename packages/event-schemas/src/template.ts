import { z } from 'zod';
import { languages } from './common';

const letterTypes = ['q4', 'x0', 'x1'];

export const $TemplateStatus = z.string().max(1000);

const $TemplateEventV1BaseData = z.object({
  owner: z.string().meta({
    description: 'The client that owns the template',
  }),
  // informal UUID
  id: z
    .string()
    // eslint-disable-next-line security/detect-unsafe-regex
    .regex(/^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/)
    .meta({
      description: 'Unique identifier for the template',
    }),
  clientId: z.string().max(1000).optional().meta({
    description: 'The client that owns the template',
  }),
  // informal ISO datetime
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    .meta({
      description: 'Timestamp for when the template was initially created',
    }),
  createdBy: z.string().max(1000).optional().meta({
    description:
      'Unique identifier for the user that initially created the template',
  }),
  name: z.string().max(1000).meta({
    description: 'User-provided template name',
  }),
  templateStatus: $TemplateStatus.meta({
    description: 'Current status of the template',
  }),
  // informal ISO datetime
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    .meta({
      description: 'Timestamp for when the template was most recently updated',
    }),
  updatedBy: z.string().max(1000).optional().meta({
    description:
      'Unique identifier for the user that most recently updated the template',
  }),
});

const $EmailTemplateEventV1Data = $TemplateEventV1BaseData
  .extend({
    message: z.string().max(100_000).meta({
      description: 'Message body for the email template',
    }),
    subject: z.string().max(1000).meta({
      description: 'Subject field for the email template',
    }),
    templateType: z.literal('EMAIL').meta({
      description: 'Template type',
    }),
  })
  .meta({
    id: 'EmailTemplateEventData',
  });

const $NhsAppTemplateEventV1Data = $TemplateEventV1BaseData
  .extend({
    message: z.string().max(5000).meta({
      description: 'Message body for the NHS App template',
    }),
    templateType: z.literal('NHS_APP').meta({
      description: 'Template type',
    }),
  })
  .meta({
    id: 'NhsAppTemplateEventData',
  });

const $LetterTemplateEventV1Data = $TemplateEventV1BaseData
  .extend({
    files: z
      .object({
        proofs: z
          .record(
            z.string(),
            z.object({
              supplier: z.string().max(1000),
            })
          )
          .optional(),
      })
      .meta({
        description:
          'Object containing information about proofs attached to the template',
      }),
    templateType: z.literal('LETTER').meta({
      description: 'Template type',
    }),
    language: z.enum(languages).meta({
      description:
        'ISO 639 language code for the language the letter template is written in',
    }),
    letterType: z.enum(letterTypes).meta({
      description:
        'Letter type - q4:British Sign Language, x1:Large Print, x0:Standard',
    }),
    personalisationParameters: z.array(z.string().max(1000)).meta({
      description: 'List of personalisation parameters used in the template',
    }),
    supplierReferences: z.record(z.string(), z.string()).optional(),
  })
  .meta({
    id: 'LetterTemplateEventData',
  });

const $SmsTemplateEventV1Data = $TemplateEventV1BaseData
  .extend({
    message: z.string().max(918).meta({
      description: 'Message body for the NHS App template',
    }),
    templateType: z.literal('SMS').meta({
      description: 'Template type',
    }),
  })
  .meta({
    id: 'SmsTemplateEventData',
  });

export const $TemplateEventV1Data = z
  .discriminatedUnion('templateType', [
    $EmailTemplateEventV1Data,
    $NhsAppTemplateEventV1Data,
    $LetterTemplateEventV1Data,
    $SmsTemplateEventV1Data,
  ])
  .meta({
    id: 'TemplateEventData',
  });
