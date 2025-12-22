import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import { ChooseChannelTemplateProps } from './choose-channel-template.types';
import {
  isLetterTemplate,
  addAccessibleFormatLetterTemplateToCascade,
  addDefaultTemplateToCascade,
  buildCascadeGroupOverridesFromCascade,
} from '@utils/routing-utils';
import { $LockNumber } from 'nhs-notify-backend-client';

export type ChooseChannelTemplateFormState = FormState &
  Omit<ChooseChannelTemplateProps, 'lockNumber'>;

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

  let updatedCascade;
  let updatedCascadeGroupOverrides = messagePlan.cascadeGroupOverrides;

  if (
    isAccessibleFormatTemplate &&
    selectedTemplate &&
    isLetterTemplate(selectedTemplate)
  ) {
    updatedCascade = addAccessibleFormatLetterTemplateToCascade(
      messagePlan.cascade,
      cascadeIndex,
      selectedTemplate
    );

    updatedCascadeGroupOverrides =
      buildCascadeGroupOverridesFromCascade(updatedCascade);
  } else {
    updatedCascade = addDefaultTemplateToCascade(
      messagePlan.cascade,
      cascadeIndex,
      selectedTemplateId,
      selectedTemplate
    );
  }

  await updateRoutingConfig(
    messagePlan.id,
    {
      cascade: updatedCascade,
      cascadeGroupOverrides: updatedCascadeGroupOverrides,
    },
    parsedForm.data.lockNumber
  );

  redirect(
    `/message-plans/choose-templates/${messagePlan.id}`,
    RedirectType.push
  );
}
