import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { getTemplate } from '@utils/form-actions';
import { interpolate } from '@utils/interpolate';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';

const pageContent = content.pages.getReadyToApproveLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageContent.pageTitle,
  };
}
const GetReadyToApproveLetterTemplatePage = async (
  props: TemplatePageProps
) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  if (
    !template ||
    template.templateType !== 'LETTER' ||
    template.letterVersion !== 'AUTHORING'
  ) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <span className='nhsuk-caption-xl'>{pageContent.stepCounter}</span>

            <h1 className='nhsuk-heading-xl'>
              {interpolate(pageContent.heading, {
                templateName: template.name,
              })}
            </h1>

            <ContentRenderer content={pageContent.body} />

            <div className='nhsuk-warning-callout'>
              <h3 className='nhsuk-warning-callout__label'>
                {pageContent.callout.label}
                <span className='nhsuk-u-visually-hidden'>:</span>
              </h3>
              <ContentRenderer content={pageContent.callout.content} />
            </div>

            <div className='nhsuk-form-group'>
              <NHSNotifyButton
                href={pageContent.continue.href(template.id)}
                data-testid='continue-link'
              >
                {pageContent.continue.text}
              </NHSNotifyButton>

              <NHSNotifyButton
                secondary
                href={pageContent.back.href(template.id)}
                className='nhsuk-u-margin-left-3'
                data-testid='back-link'
              >
                {pageContent.back.text}
              </NHSNotifyButton>
            </div>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default GetReadyToApproveLetterTemplatePage;
