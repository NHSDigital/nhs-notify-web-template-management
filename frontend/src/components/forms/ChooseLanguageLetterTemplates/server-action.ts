import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import {
  replaceLanguageTemplatesInCascadeItem,
  buildCascadeGroupOverridesFromCascade,
} from '@utils/routing-utils';
import { Language } from 'nhs-notify-backend-client';
import { ChooseLanguageLetterTemplatesProps } from './ChooseLanguageLetterTemplates';
import baseContent from '@content/content';

const content = baseContent.components.chooseLanguageLetterTemplates;

export type ChooseLanguageLetterTemplatesFormState = FormState &
  ChooseLanguageLetterTemplatesProps & {
    selectedTemplateIds?: string[];
    errorType?: 'missing' | 'duplicate';
  };

const formDataSchema = z.record(z.string(), z.string());

export const $ChooseLanguageLetterTemplates = (errorMessage: string) =>
  formDataSchema.refine(
    (data) =>
      Object.keys(data).some((key) => key.startsWith('template_') && data[key]),
    {
      message: errorMessage,
    }
  );

export async function chooseLanguageLetterTemplatesAction(
  formState: ChooseLanguageLetterTemplatesFormState,
  formData: FormData
): Promise<ChooseLanguageLetterTemplatesFormState> {
  const { messagePlan, cascadeIndex, templateList } = formState;

  const selectedLanguages: Language[] = [];
  const selectedTemplateIds: string[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('template_') && typeof value === 'string') {
      const [templateId, language] = value.split(':');

      if (templateId && language) {
        selectedLanguages.push(language as Language);
        selectedTemplateIds.push(templateId);
      }
    }
  }

  const uniqueLanguages = new Set(selectedLanguages);
  if (selectedLanguages.length !== uniqueLanguages.size) {
    return {
      ...formState,
      selectedTemplateIds,
      errorType: 'duplicate',
      errorState: {
        formErrors: [content.error.duplicate.hintText],
      },
    };
  }

  const selectedTemplateIdsSet = new Set(selectedTemplateIds);
  const templateMap = new Map(
    templateList
      .filter((template) => selectedTemplateIdsSet.has(template.id))
      .map((template) => [template.id, template])
  );

  const updatedCascade = [...messagePlan.cascade];

  updatedCascade[cascadeIndex] = replaceLanguageTemplatesInCascadeItem(
    updatedCascade[cascadeIndex],
    [...templateMap.values()]
  );

  const updatedCascadeGroupOverrides =
    buildCascadeGroupOverridesFromCascade(updatedCascade);

  await updateRoutingConfig(messagePlan.id, {
    cascade: updatedCascade,
    cascadeGroupOverrides: updatedCascadeGroupOverrides,
  });

  redirect(
    `/message-plans/choose-templates/${messagePlan.id}`,
    RedirectType.push
  );
}
