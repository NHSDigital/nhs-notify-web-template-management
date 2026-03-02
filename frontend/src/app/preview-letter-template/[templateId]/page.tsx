import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type {
  AuthoringLetterTemplate,
  TemplatePageProps,
} from 'nhs-notify-web-template-management-utils';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { PreviewPdfLetterTemplate } from '@organisms/PreviewPdfLetterTemplate/PreviewPdfLetterTemplate';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { getTemplate } from '@utils/form-actions';
import { submitAuthoringLetterAction } from './server-action';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { PreviewAuthoringLetterTemplate } from '@organisms/PreviewAuthoringLetterTemplate/PreviewAuthoringLetterTemplate';

const { pageTitle, validationErrorMessages } =
  content.components.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

function getValidationErrors(template: AuthoringLetterTemplate): string[] {
  if (template.templateStatus !== 'VALIDATION_FAILED') return [];

  return (
    template.validationErrors?.flatMap(
      (error) => validationErrorMessages[error.name]
    ) ?? []
  );
}

export default async function PreviewLetterTemplatePage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (validatedTemplate.letterVersion === 'PDF') {
    return (
      <NHSNotifyContainer>
        <PreviewPdfLetterTemplate template={validatedTemplate} />
      </NHSNotifyContainer>
    );
  }

  // AUTHORING letter
  return (
    <NHSNotifyContainer fullWidth>
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getValidationErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <PreviewAuthoringLetterTemplate template={validatedTemplate} />
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
