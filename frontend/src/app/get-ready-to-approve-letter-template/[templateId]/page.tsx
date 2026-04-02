import { Metadata } from 'next';
import { redirect, RedirectType } from 'next/navigation';
import {
  getPreviewURL,
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { getTemplate } from '@utils/form-actions';
import { interpolate } from '@utils/interpolate';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
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

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || validatedTemplate.letterVersion !== 'AUTHORING') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const searchParams = await props.searchParams;

  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(getPreviewURL(validatedTemplate), RedirectType.replace);
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <span className='nhsuk-caption-xl'>{pageContent.stepCounter}</span>

            <h1 className='nhsuk-heading-xl'>
              {interpolate(pageContent.heading, {
                templateName: validatedTemplate.name,
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
                href={interpolate(pageContent.continue.href, {
                  templateId: validatedTemplate.id,
                  lockNumber: lockNumberResult.data,
                })}
                data-testid='continue-button'
              >
                {pageContent.continue.text}
              </NHSNotifyButton>

              <NHSNotifyButton
                secondary
                href={interpolate(pageContent.back.href, {
                  templateId: validatedTemplate.id,
                })}
                className='nhsuk-u-margin-left-3'
                data-testid='back-button'
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
