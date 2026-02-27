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
import { AuthoringPreviewContent } from './AuthoringPreviewContent';

const { pageTitle, backLinkText, submitText, links, validationErrorMessages } =
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
  const showRenderer =
    validatedTemplate.files.initialRender?.status === 'RENDERED' ||
    (validatedTemplate.templateStatus === 'NOT_YET_SUBMITTED' &&
      validatedTemplate.files.initialRender?.status === 'PENDING');

  // TODO: CCM-13495
  // all of this might need to become a client component
  // because lock number will change when updating previews

  return (
    <NHSNotifyContainer fullWidth={showRenderer}>
      <NHSNotifyFormProvider
        initialState={{
          errorState: {
            formErrors: getValidationErrors(validatedTemplate),
          },
        }}
        serverAction={submitAuthoringLetterAction}
      >
        <AuthoringPreviewContent
          template={validatedTemplate}
          backLinkText={backLinkText}
          backLinkHref={links.messageTemplates}
          submitText={submitText}
          loadingText='Loading letter preview'
        />
      </NHSNotifyFormProvider>
    </NHSNotifyContainer>
  );
}
