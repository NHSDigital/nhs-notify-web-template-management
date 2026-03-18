'use server';

import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { Metadata } from 'next';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const pageContent = content.pages.getReadyToApproveLetterTemplate;

export const metadata: Metadata = {
  title: pageContent.pageTitle,
};

const GetReadyToApproveLetterTemplate = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
          <div className='nhsuk-grid-column-two-thirds'>
            <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
              {pageContent.pageHeading}
            </h1>

            <NHSNotifyButton
              href={pageContent.pageLinkButtons.approve.url.replace(
                '{templateId}',
                templateId
              )}
              data-testid='continue'
            >
              {pageContent.pageLinkButtons.approve.text}
            </NHSNotifyButton>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default GetReadyToApproveLetterTemplate;
