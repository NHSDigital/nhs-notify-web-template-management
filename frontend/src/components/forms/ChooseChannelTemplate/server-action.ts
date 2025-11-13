import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import { ChooseChannelTemplateProps } from './choose-channel-template.types';

export type ChooseChannelTemplateFormState = FormState &
  ChooseChannelTemplateProps;

export const $ChooseChannelTemplate = (errorMessage: string) =>
  z.object({
    channelTemplate: z.string({
      message: errorMessage,
    }),
  });

export async function chooseChannelTemplateAction(
  formState: ChooseChannelTemplateFormState,
  formData: FormData
): Promise<ChooseChannelTemplateFormState> {
  const { messagePlan, cascadeIndex, pageHeading } = formState;

  const parsedForm = $ChooseChannelTemplate(pageHeading).safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsedForm.error),
    };
  }

  const newCascade = messagePlan.cascade.map((item, index) =>
    index === cascadeIndex
      ? { ...item, defaultTemplateId: parsedForm.data.channelTemplate }
      : item
  );

  await updateRoutingConfig(messagePlan.id, {
    cascade: newCascade,
    cascadeGroupOverrides: messagePlan.cascadeGroupOverrides,
  });

  redirect(
    `/message-plans/choose-templates/${messagePlan.id}`,
    RedirectType.push
  );
}
