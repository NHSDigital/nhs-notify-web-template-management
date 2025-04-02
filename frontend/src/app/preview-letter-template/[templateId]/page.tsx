'use server';

import {
  PageProps,
  validateLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import content from '@content/content';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { PreviewTemplateDetails } from '@molecules/PreviewTemplateDetails';
import Link from 'next/link';
import { BackLink } from 'nhsuk-react-components';

const PreviewLetterTemplatePage = async (props: PageProps) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateLetterTemplate(template);

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const { backLinkText, buttonText } = content.components.previewLetterTemplate;
  const basePath = getBasePath();

  return (
    <>
      <BackLink href={`${basePath}/manage-templates`} id='back-link'>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetails.Letter template={validatedTemplate} />
            <NHSNotifyButton
              data-testid='submit-button'
              id='preview-letter-template-submit-button'
              href={`${basePath}/submit-letter-template/${validatedTemplate.id}`}
            >
              {buttonText}
            </NHSNotifyButton>
            <p>
              <Link href='/manage-templates'>{backLinkText}</Link>
            </p>
          </div>
        </div>
      </NHSNotifyMain>
    </>
  );
};

export default PreviewLetterTemplatePage;
