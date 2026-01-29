import { redirect, RedirectType } from 'next/navigation';
import {
  FormState,
  PdfProofingLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { updateRoutingConfig } from '@utils/message-plans';
import {
  replaceLanguageTemplatesInCascadeItem,
  isPdfProofingLetter,
} from '@utils/routing-utils';
import { Language, $LockNumber } from 'nhs-notify-backend-client';
import { ChooseLanguageLetterTemplatesProps } from './ChooseLanguageLetterTemplates';
import baseContent from '@content/content';

const content = baseContent.components.chooseLanguageLetterTemplates;

export type ChooseLanguageLetterTemplatesFormState = FormState &
  Omit<ChooseLanguageLetterTemplatesProps, 'lockNumber'> & {
    selectedTemplateIds?: string[];
    errorType?: 'missing' | 'duplicate';
  };

export const $ChooseLanguageLetterTemplates = (errorMessage: string) =>
  z
    .object({
      lockNumber: $LockNumber,
    })
    .catchall(z.string())
    .superRefine((data, ctx) => {
      const hasTemplates = Object.keys(data).some(
        (key) => key.startsWith('template_') && data[key]
      );

      if (!hasTemplates) {
        ctx.addIssue({
          code: 'custom',
          message: errorMessage,
          path: ['language-templates'],
        });
      }
    });

export async function chooseLanguageLetterTemplatesAction(
  formState: ChooseLanguageLetterTemplatesFormState,
  formData: FormData
): Promise<ChooseLanguageLetterTemplatesFormState> {
  const { messagePlan, cascadeIndex, templateList } = formState;

  const parsedForm = $ChooseLanguageLetterTemplates(
    content.error.missing.linkText
  ).safeParse(Object.fromEntries(formData.entries()));

  if (!parsedForm.success) {
    return {
      ...formState,
      selectedTemplateIds: [],
      errorType: 'missing',
      errorState: z.flattenError(parsedForm.error) as FormState['errorState'],
    };
  }

  const { lockNumber, ...templateSelections } = parsedForm.data;

  const selectedLanguages: Language[] = [];
  const selectedTemplateIds: string[] = [];

  for (const [key, value] of Object.entries(templateSelections)) {
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
        fieldErrors: {
          'language-templates': [content.error.duplicate.linkText],
        },
      },
    };
  }

  const selectedTemplateIdsSet = new Set(selectedTemplateIds);
  const templateMap = new Map<string, PdfProofingLetterTemplate>(
    templateList
      .filter(
        (template): template is PdfProofingLetterTemplate =>
          selectedTemplateIdsSet.has(template.id) &&
          isPdfProofingLetter(template)
      )
      .map((template) => [template.id, template])
  );

  const updatedCascade = [...messagePlan.cascade];

  updatedCascade[cascadeIndex] = replaceLanguageTemplatesInCascadeItem(
    updatedCascade[cascadeIndex],
    [...templateMap.values()]
  );

  await updateRoutingConfig(
    messagePlan.id,
    {
      cascade: updatedCascade,
      cascadeGroupOverrides: messagePlan.cascadeGroupOverrides,
    },
    lockNumber
  );

  redirect(
    `/message-plans/choose-templates/${messagePlan.id}`,
    RedirectType.push
  );
}
