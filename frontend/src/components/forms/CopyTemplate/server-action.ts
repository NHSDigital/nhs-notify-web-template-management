'use server';

import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { createTemplate } from '@utils/form-actions';
import { format } from 'date-fns/format';
import {
  TEMPLATE_TYPE_LIST,
  TemplateDto,
  TemplateType,
} from 'nhs-notify-backend-client';

const [firstType, ...remainingTypes] = TEMPLATE_TYPE_LIST;

const $CopyTemplate = z.object({
  templateType: z.enum([firstType, ...remainingTypes], {
    message: 'Select a template type',
  }),
});

type CopyTemplateActionState = FormState & {
  template: TemplateDto & {
    templateType: Exclude<TemplateType, 'LETTER'>;
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
    formState.template.templateType === 'EMAIL'
      ? formState.template.subject
      : 'Enter a subject line';

  const copyName = `COPY (${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}): ${name}`;

  switch (newTemplateType) {
    case 'NHS_APP':
    case 'SMS': {
      await createTemplate({
        name: copyName,
        message,
        templateType: newTemplateType,
      });

      break;
    }
    case 'EMAIL': {
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
