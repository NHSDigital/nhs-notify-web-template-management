import {
  LetterTemplate,
  MessagePlanAndTemplatePageProps,
  templateTypeToUrlTextMappings,
  isFrontendSupportedLetterType,
  FrontendSupportedLetterType,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { getLetterVariantById, getTemplate } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { NHSNotifyContainer } from '@layouts/container/container';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyBackLink } from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import Link from 'next/link';
import baseContent from '@content/content';
import { interpolate } from '@utils/interpolate';

type PreviewLetterFromChooseTemplateProps = MessagePlanAndTemplatePageProps & {
  validateTemplate: (template?: TemplateDto) => LetterTemplate | undefined;
  redirectUrlOnLockNumberFailure: string;
};

export const PreviewLetterFromChooseTemplate = async (
  props: PreviewLetterFromChooseTemplateProps
) => {
  const { templateId, routingConfigId } = await props.params;
  const { redirectUrlOnLockNumberFailure } = props;

  const searchParams = await props.searchParams;
  const lockNumberResult = $LockNumber.safeParse(searchParams?.lockNumber);

  if (!lockNumberResult.success) {
    return redirect(redirectUrlOnLockNumberFailure, RedirectType.replace);
  }

  const lockNumber = lockNumberResult.data;

  const template = await getTemplate(templateId);

  const validatedTemplate = props.validateTemplate(template);

  if (
    !validatedTemplate ||
    !('letterVariantId' in validatedTemplate) ||
    !validatedTemplate.letterVariantId
  ) {
    return redirect('/invalid-template', RedirectType.replace);
  }

  const letterVariant = await getLetterVariantById(
    validatedTemplate.letterVariantId
  );

  const content = baseContent.components.previewTemplateFromMessagePlan;

  let letterType: FrontendSupportedLetterType | undefined;
  const isForeignLanguage =
    validatedTemplate.language && validatedTemplate.language !== 'en';
  if (isForeignLanguage) {
    letterType = 'language';
  } else if (isFrontendSupportedLetterType(validatedTemplate.letterType)) {
    letterType = validatedTemplate.letterType;
  }

  const backLinkHref = interpolate(content.backLink.href, {
    templateType: templateTypeToUrlTextMappings(
      validatedTemplate.templateType,
      letterType
    ),
    routingConfigId,
    lockNumber,
  });

  return (
    <NHSNotifyContainer>
      <NHSNotifyBackLink href={backLinkHref}>
        {content.backLink.text}
      </NHSNotifyBackLink>

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
            <Link
              className='nhsuk-link nhsuk-body-m nhsuk-u-display-inline-block'
              href={backLinkHref}
              data-testid='back-link-bottom'
            >
              {content.backLink.text}
            </Link>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
};
