import markdownit from 'markdown-it';
import {
  TemplateFormState,
  NHSAppTemplate,
  CreateUpdateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import { INVALID_PERSONALISATION_FIELDS } from '@utils/constants';
import content from '@content/content';

const {
  components: {
    templateFormNhsApp: { form },
  },
} = content;

const hasInvalidCharactersInLinks = (message: string): boolean => {
  const md = markdownit();

  const parsedMessage = md.parseInline(message, {});
  // [] branch should be unreachable
  /* istanbul ignore next */
  const tokens = parsedMessage[0]?.children || [];

  for (const token of tokens) {
    if (token.type === 'link_open') {
      const href = token.attrGet('href');
      if (href && !message.includes(href)) {
        // markdown-it url-encodes angle brackets during parsing, so the original url must have included them
        return true;
      }
    }
  }
  return false;
};

export const $CreateNhsAppTemplateSchema = z.object({
  nhsAppTemplateName: z
    .string({ message: form.nhsAppTemplateName.error.empty })
    .min(1, { message: form.nhsAppTemplateName.error.empty }),
  nhsAppTemplateMessage: z
    .string({ message: form.nhsAppTemplateMessage.error.empty })
    .min(1, { message: form.nhsAppTemplateMessage.error.empty })
    .max(5000, { message: form.nhsAppTemplateMessage.error.max })
    .refine((templateMessage) => !templateMessage.includes('http://'), {
      message: form.nhsAppTemplateMessage.error.insecureLink,
    })
    .refine(
      (templateMessage) => !hasInvalidCharactersInLinks(templateMessage),
      { message: form.nhsAppTemplateMessage.error.invalidUrlCharacter }
    )
    .refine(
      (templateMessage) =>
        !INVALID_PERSONALISATION_FIELDS.some((personalisationFieldName) =>
          templateMessage.includes(`((${personalisationFieldName}))`)
        ),
      {
        message: `${form.nhsAppTemplateMessage.error.invalidPersonalisation} ${INVALID_PERSONALISATION_FIELDS.join(', ')}`,
      }
    ),
});

export async function processFormActions(
  formState: TemplateFormState<NHSAppTemplate | CreateUpdateNHSAppTemplate>,
  formData: FormData
): Promise<TemplateFormState<NHSAppTemplate | CreateUpdateNHSAppTemplate>> {
  const parsedForm = $CreateNhsAppTemplateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsedForm.error),
    };
  }

  delete formState.errorState;

  const { nhsAppTemplateName, nhsAppTemplateMessage } = parsedForm.data;

  const template = {
    ...formState,
    name: nhsAppTemplateName,
    message: nhsAppTemplateMessage,
  };

  let savedId: string;

  if ('id' in template) {
    const { success, data: templateId } = z.uuidv4().safeParse(template.id);

    if (!success) {
      return redirect('/invalid-template', RedirectType.replace);
    }

    const saved = await saveTemplate(templateId, template);
    savedId = saved.id;
  } else {
    const saved = await createTemplate(template);
    savedId = saved.id;
  }

  return redirect(
    `/preview-nhs-app-template/${savedId}?from=edit`,
    RedirectType.push
  );
}
