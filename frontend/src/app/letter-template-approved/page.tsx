'use server';

import {
  TemplatePageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';
import { Metadata } from 'next';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

const { title, bannerText } = content.pages.letterTemplateApproved;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
  };
}

const LetterTemplateApprovedPage = async (props: TemplatePageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate || validatedTemplate.letterVersion !== 'AUTHORING') {
    return redirect('/invalid-template', RedirectType.replace);
  }

  if (validatedTemplate.templateStatus !== 'PROOF_APPROVED') {
    return redirect(
      `/preview-letter-template/${templateId}`,
      RedirectType.replace
    );
  }

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <div className='notify-confirmation-panel'>
              <h1
                id='template-submitted'
                className='nhsuk-heading-l nhsuk-u-margin-bottom-0'
              >
                {bannerText}
              </h1>
            </div>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};

export default LetterTemplateApprovedPage;
