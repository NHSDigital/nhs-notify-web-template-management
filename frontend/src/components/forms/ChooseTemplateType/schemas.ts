import { z } from 'zod';
import { TEMPLATE_TYPE_LIST } from 'nhs-notify-backend-client';
import { SUPPORTED_LETTER_TYPES } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const {
  templateType: { error: templateTypeError },
  letterType: { error: letterTypeError },
} = content.components.chooseTemplateType.form;

export const $ChooseTemplateTypeBase = z.object({
  templateType: z.enum(TEMPLATE_TYPE_LIST, {
    message: templateTypeError,
  }),
});

export const $ChooseTemplateTypeWithLetterAuthoring = z
  .object({
    templateType: z.enum(TEMPLATE_TYPE_LIST, {
      message: templateTypeError,
    }),
    letterType: z
      .enum(SUPPORTED_LETTER_TYPES, {
        message: letterTypeError,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.templateType === 'LETTER' && !data.letterType) {
      ctx.addIssue({
        code: 'custom',
        path: ['letterType'],
        message: letterTypeError,
      });
    }
  });
