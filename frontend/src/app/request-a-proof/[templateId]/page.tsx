import { Metadata } from 'next';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import pageContent from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

const { pageTitle, content, backLink } =
  pageContent.components.howToRequestADigitalProof;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const channelSlug = {
  NHS_APP: 'nhs-app',
  SMS: 'text-message',
  EMAIL: 'email',
};

const RequestDigitalProofPage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;
  const template = await getTemplate(templateId);

  if (!template || template.templateType === 'LETTER') {
    return redirect('/message-templates');
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyBackLink
        href={`/preview-${channelSlug[template.templateType]}-template/${templateId}`}
      >
        {backLink.text}
      </NHSNotifyBackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <ContentRenderer content={content} />
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default RequestDigitalProofPage;
