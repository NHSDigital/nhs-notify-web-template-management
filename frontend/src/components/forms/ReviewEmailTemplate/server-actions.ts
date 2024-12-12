import { MarkdownItWrapper } from '@utils/markdownit';
import {
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod';

export const $FormSchema = z.object({
  reviewEmailTemplateAction: z.enum(['email-edit', 'email-submit'], {
    message: 'Select an option',
  }),
});

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown
    .enableLineBreak()
    .enable(['heading', 'link', 'list', 'emphasis', 'hr']);

  return markdown.render(value);
}

export async function reviewEmailTemplateAction(
  formState: TemplateFormState<EmailTemplate>,
  formData: FormData
) {
  const form = Object.fromEntries(formData.entries());

  const { success, error, data } = $FormSchema.safeParse(form);

  if (!success) {
    return {
      ...formState,
      validationError: error.flatten(),
    };
  }

  if (data.reviewEmailTemplateAction === 'email-edit') {
    return redirect(`/edit-email-template/${formState.id}`, RedirectType.push);
  }

  if (data.reviewEmailTemplateAction === 'email-submit') {
    return redirect(
      `/submit-email-template/${formState.id}`,
      RedirectType.push
    );
  }

  throw new Error('Unknown review email template action.');
}
