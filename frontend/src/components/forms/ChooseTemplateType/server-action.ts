'use server';

import { redirect, RedirectType } from 'next/navigation';
import {
  createTemplateUrl,
  FormState,
  legacyTemplateCreationPages,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { serverIsFeatureEnabled } from '@utils/server-features';
import {
  $ChooseTemplateTypeBase,
  $ChooseTemplateTypeWithLetterAuthoring,
} from './schemas';

export async function chooseTemplateTypeAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const hasLetterAuthoring = await serverIsFeatureEnabled('letterAuthoring');

  if (hasLetterAuthoring) {
    const parsedForm = $ChooseTemplateTypeWithLetterAuthoring.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!parsedForm.success) {
      return {
        errorState: z.flattenError(parsedForm.error),
      };
    }

    const { templateType, letterType } = parsedForm.data;

    redirect(createTemplateUrl(templateType, letterType), RedirectType.push);
  } else {
    const parsedForm = $ChooseTemplateTypeBase.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!parsedForm.success) {
      return {
        errorState: z.flattenError(parsedForm.error),
      };
    }

    const { templateType } = parsedForm.data;

    redirect(legacyTemplateCreationPages(templateType), RedirectType.push);
  }
}
