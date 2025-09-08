import { z } from 'zod';

const templateStatuses = [
  'DELETED',
  'NOT_YET_SUBMITTED',
  'PENDING_PROOF_REQUEST',
  'PENDING_UPLOAD',
  'PENDING_VALIDATION',
  'PROOF_AVAILABLE',
  'SUBMITTED',
  'VALIDATION_FAILED',
  'VIRUS_SCAN_FAILED',
  'WAITING_FOR_PROOF',
];

const languages = [
  'ar',
  'bg',
  'bn',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fr',
  'gu',
  'hi',
  'hu',
  'it',
  'ku',
  'lt',
  'lv',
  'ne',
  'pa',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'so',
  'sq',
  'ta',
  'tr',
  'ur',
  'zh',
];

const letterTypes = ['q4', 'x0', 'x1'];

export const $TemplateStatus = z.enum(templateStatuses);

const $TemplateEventV1BaseData = z.object({
  owner: z.string().meta({
    description: 'The client or user that owns the template',
  }),
  id: z.uuid().meta({
    description: 'Unique identifier for the template',
  }),
  clientId: z.string().max(1000).optional().meta({
    description: 'The client that owns the template',
  }),
  createdAt: z.string().max(1000).meta({
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
  updatedAt: z.string().max(1000).meta({
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
      description: 'Langauge the letter template is written in',
    }),
    letterType: z.enum(letterTypes).meta({
      description: 'Letter type',
    }),
    personalisationParameters: z.array(z.string().max(1000)).meta({
      description: 'List of personalisation parameters used in the template',
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

export const $TemplateEventV1Data = z.discriminatedUnion('templateType', [
  $EmailTemplateEventV1Data,
  $NhsAppTemplateEventV1Data,
  $LetterTemplateEventV1Data,
  $SmsTemplateEventV1Data,
]);
