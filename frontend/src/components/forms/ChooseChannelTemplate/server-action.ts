import { redirect, RedirectType } from 'next/navigation';
import type { FormState } from '@utils/types';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import { ChooseChannelTemplateFormProps } from './choose-channel-template.types';
import {
  isLetterTemplate,
  addAccessibleFormatLetterTemplateToCascade,
  addDefaultTemplateToCascade,
} from '@utils/routing-utils';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';

export type ChooseChannelTemplateFormState = FormState &
  ChooseChannelTemplateFormProps;

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
  const {
    messagePlan,
    cascadeIndex,
    templateList,
    pageHeading,
    accessibleFormat,
  } = formState;

  const parsedForm = $ChooseChannelTemplate(pageHeading).safeParse({
    channelTemplate: formData.get('channelTemplate'),
    lockNumber: formData.get('lockNumber'),
  });

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

  const isAccessibleFormatTemplate = !!accessibleFormat;

  const updatedCascade =
    isAccessibleFormatTemplate &&
    selectedTemplate &&
    isLetterTemplate(selectedTemplate)
      ? addAccessibleFormatLetterTemplateToCascade(
          messagePlan.cascade,
          cascadeIndex,
          selectedTemplate
        )
      : addDefaultTemplateToCascade(
          messagePlan.cascade,
          cascadeIndex,
          selectedTemplateId,
          selectedTemplate
        );

  await updateRoutingConfig(
    messagePlan.id,
    {
      cascade: updatedCascade,
      cascadeGroupOverrides: messagePlan.cascadeGroupOverrides,
    },
    parsedForm.data.lockNumber
  );

  redirect(
    `/message-plans/edit-message-plan/${messagePlan.id}`,
    RedirectType.push
  );
}
