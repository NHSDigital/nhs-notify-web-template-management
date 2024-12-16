'use server';

import { redirect, RedirectType } from 'next/navigation';
import {
  FormState,
  Template,
} from 'nhs-notify-web-template-management-utils/src/types';
import {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils/src/enum';
import { z } from 'zod';
import { createTemplate } from '@utils/form-actions';
import { format } from 'date-fns/format';

const $CopyTemplate = z.object({
  templateType: z.nativeEnum(TemplateType, {
    message: 'Select a template type',
  }),
});

type CopyTemplateActionState = FormState & {
  template: Template;
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
  const {
    subject,
    name,
    id: _1,
    createdAt: _2,
    ...baseTemplateAttributes
  } = formState.template;

  await createTemplate({
    ...baseTemplateAttributes,
    name: `COPY (${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}): ${name}`,
    templateType: newTemplateType,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    ...(newTemplateType === TemplateType.EMAIL && {
      subject: subject ?? 'Enter a subject line',
    }),
  });

  return redirect(`/manage-templates`, RedirectType.push);
};
