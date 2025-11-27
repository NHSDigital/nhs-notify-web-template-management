import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import { ChooseChannelTemplateProps } from './choose-channel-template.types';
import { $LockNumber } from 'nhs-notify-backend-client';

export type ChooseChannelTemplateFormState = FormState &
  Pick<
    ChooseChannelTemplateProps,
    'cascadeIndex' | 'messagePlan' | 'pageHeading'
  >;

export const $ChooseChannelTemplate = (errorMessage: string) =>
  z.object({
    channelTemplate: z.string({
      message: errorMessage,
    }),
    lockNumber: $LockNumber,
  });

export async function chooseChannelTemplateAction(
  formState: ChooseChannelTemplateFormState,
  formData: FormData
): Promise<ChooseChannelTemplateFormState> {
  const { messagePlan, cascadeIndex, templateList, pageHeading } = formState;

  const parsedForm = $ChooseChannelTemplate(pageHeading).safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsedForm.error),
    };
  }

  const selectedTemplateId = parsedForm.data.channelTemplate;

  const selectedTemplate = templateList.find(
    ({ id }) => id === selectedTemplateId
  );

  const newCascade = messagePlan.cascade.map((item, index) =>
    index === cascadeIndex
      ? {
          ...item,
          defaultTemplateId: selectedTemplateId,
          ...(selectedTemplate?.templateType === 'LETTER' &&
          selectedTemplate.supplierReferences
            ? { supplierReferences: selectedTemplate.supplierReferences }
            : {}),
        }
      : item
  );

  await updateRoutingConfig(
    messagePlan.id,
    {
      cascade: newCascade,
      cascadeGroupOverrides: messagePlan.cascadeGroupOverrides,
    },
    parsedForm.data.lockNumber
  );

  redirect(
    `/message-plans/choose-templates/${messagePlan.id}`,
    RedirectType.push
  );
}
