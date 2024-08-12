import { z } from 'zod';
import { MarkdownItWrapper } from '@utils/markdownit';
import { zodValidationServerAction } from '@utils/zod-validation-server-action';
import { TemplateFormState } from '@utils/types';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}

export function handleForm(state: TemplateFormState, data: FormData) {
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
    validation.page = 'submit-template';
  }

  return validation;
}

export function handleFormBack(state: TemplateFormState, data: FormData) {
  return zodValidationServerAction(
    state,
    data,
    z.object({}),
    'create-nhs-app-template'
  );
}
