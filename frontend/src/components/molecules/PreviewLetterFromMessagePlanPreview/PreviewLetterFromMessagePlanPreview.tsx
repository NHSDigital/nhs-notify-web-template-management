import {
  MessagePlanAndTemplatePageProps,
  validateAuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';

export const PreviewLetterFromMessagePlanPreview = async (
  props: MessagePlanAndTemplatePageProps
) => {
  const { templateId } = await props.params;

  const template = await getTemplate(templateId);

  const validatedTemplate = validateAuthoringLetterTemplate(template);

  if (!validatedTemplate || !validatedTemplate.letterVariantId) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-full'>
            <PreviewTemplateDetailsLetter
              template={validatedTemplate}
              letterVariant={letterVariant}
              hideStatus
              hideEditActions
              hideLearnMore
            />
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};
