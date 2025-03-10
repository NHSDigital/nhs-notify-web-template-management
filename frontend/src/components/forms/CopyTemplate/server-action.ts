'use server';

import { redirect, RedirectType } from 'next/navigation';
import {
  FormState,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { createTemplate } from '@utils/form-actions';
import { format } from 'date-fns/format';
import { TemplateDTO } from 'nhs-notify-backend-client';

const $CopyTemplate = z.object({
  templateType: z.nativeEnum(TemplateType, {
    message: 'Select a template type',
  }),
});

type CopyTemplateActionState = FormState & {
  template: TemplateDTO & {
    templateType: Exclude<TemplateType, TemplateType.LETTER>;
  };
};
type CopyTemplateAction = (
  formState: CopyTemplateActionState,
  formData: FormData
) => Promise<CopyTemplateActionState>;

export const copyTemplateAction: CopyTemplateAction = async (
  formState,
  formData
) => {
  const parsedForm = $CopyTemplate.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      validationError: parsedForm.error.flatten(),
    };
  }

  const newTemplateType = parsedForm.data.templateType;
  const { name, message } = formState.template;
  const subject =
    formState.template.templateType === TemplateType.EMAIL
      ? formState.template.subject
      : 'Enter a subject line';

  const copyName = `COPY (${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}): ${name}`;

  switch (newTemplateType) {
    case TemplateType.NHS_APP:
    case TemplateType.SMS: {
      await createTemplate({
        name: copyName,
        message,
        templateType: newTemplateType,
      });

      break;
    }
    case TemplateType.EMAIL: {
      await createTemplate({
        name: copyName,
        message,
        templateType: newTemplateType,
        subject,
      });

      break;
    }
    // no default
  }

  return redirect(`/manage-templates`, RedirectType.push);
};
