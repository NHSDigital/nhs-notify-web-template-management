import { redirect, RedirectType } from 'next/navigation';
import type { Metadata } from 'next';
import type { TemplatePageProps } from 'nhs-notify-web-template-management-utils';
import {
  $AuthoringLetterTemplate,
  zodValidate,
} from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { LetterRender } from '@molecules/LetterRender';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import { getTemplate } from '@utils/form-actions';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';

const { approvedPageTitle, backLinkText, links } =
  content.pages.previewLetterTemplate;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: approvedPageTitle,
  };
}

export default async function PreviewApprovedLetterTemplatePage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  const validatedTemplate = zodValidate(
    z.intersection(
      $AuthoringLetterTemplate,
      z.object({
        templateStatus: z.enum(['PROOF_APPROVED', 'SUBMITTED']),
      })
    ),
    template
  );

  if (!validatedTemplate) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  return (
    <NHSNotifyContainer fullWidth>
      <NHSNotifyContainer>
        <NHSNotifyBackLink href={links.messageTemplates}>
          {backLinkText}
        </NHSNotifyBackLink>
      </NHSNotifyContainer>
      <NHSNotifyMain>
        <NHSNotifyContainer>
          <div className='nhsuk-grid-row'>
            <div className='nhsuk-grid-column-full'>
              <PreviewTemplateDetailsAuthoringLetter
                template={validatedTemplate}
                hideEditActions={true}
              />
            </div>
          </div>
        </NHSNotifyContainer>
        <LetterRender template={validatedTemplate} hideEditActions={true} />
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
