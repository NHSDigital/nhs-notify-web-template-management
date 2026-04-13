import { z } from 'zod';
import { languages } from './common';

const letterTypes = ['q1', 'q4', 'x0', 'x1', 'x3'];

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
        docxTemplate: z.object({
          url: z.string(),
        }),
      })
      .meta({
        description:
          'Object containing information about the location of the template file',
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
        'Letter type - q1:Braille, q4:British Sign Language, x0:Standard, x1:Large Print, x3:Audio',
    }),
    personalisationParameters: z.array(z.string().max(1000)).meta({
      description: 'List of personalisation parameters used in the template',
    }),
    letterVariantId: z.string().meta({
      description: 'Letter variant ID',
    }),
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
