import { z } from 'zod';
import { MarkdownItWrapper } from '@utils/markdownit';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { FormState } from '@utils/types';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}

export function handleForm(state: FormState, data: FormData) {
  const validation = zodValidationServerAction(
    state,
    data,
    z.object({
      reviewNHSAppTemplateAction: z.enum(['nhsapp-edit', 'nhsapp-submit'], {
        message: 'Select an option',
      }),
    }),
    'review-nhs-app-template'
  );

  if (validation.validationError) {
    return validation;
  }

  const action = validation.reviewNHSAppTemplateAction;

  if (action === 'nhsapp-edit') {
    validation.page = 'create-nhs-app-template';
  }

  if (action === 'nhsapp-submit') {
    validation.page = 'review-nhs-app-template';
  }

  return validation;
}

export function handleFormBack(state: FormState, data: FormData) {
  return zodValidationServerAction(
    state,
    data,
    z.object({}),
    'create-nhs-app-template'
  );
}
