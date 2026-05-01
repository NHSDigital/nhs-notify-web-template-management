import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { z } from 'zod/v4';

export const $FormSchema = z
  .object({
    templateId: z.string().nonempty(),
    lockNumber: $LockNumber,
    letterVariantId: z.string(),
    letterVariantMaxSheets: z.string(),
    letterVariantBothSidesFlag: z.string(),
    templatePageCount: z.string(),
    shortRenderPageCount: z.string(),
    longRenderPageCount: z.string(),
    shortFormRenderStatus: z.string(),
    longFormRenderStatus: z.string(),
  })
  .transform((form) => {
    return {
      ...form,
      letterVariantMaxSheets: Number.parseInt(form.letterVariantMaxSheets),
      letterVariantBothSidesFlag:
        Number.parseInt(form.letterVariantBothSidesFlag) > 0,
      templatePageCount: Number.parseInt(form.templatePageCount),
      shortRenderPageCount: Number.parseInt(form.shortRenderPageCount),
      longRenderPageCount: Number.parseInt(form.longRenderPageCount),
    };
  });
