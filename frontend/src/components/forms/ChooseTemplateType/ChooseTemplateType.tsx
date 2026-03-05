'use client';

import { useActionState, useState } from 'react';
import { Radios } from 'nhsuk-react-components';
import { ChooseTemplateTypeRadios } from '@molecules/ChooseTemplateTypeRadios/ChooseTemplateTypeRadios';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import copy from '@content/content';
import {
  ErrorState,
  SUPPORTED_LETTER_TYPES,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { chooseTemplateTypeAction } from './server-action';
import {
  $ChooseTemplateTypeBase,
  $ChooseTemplateTypeWithLetterAuthoring,
} from './schemas';
import type { TemplateType } from 'nhs-notify-web-template-management-types';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { useFeatureFlags } from '@providers/client-config-provider';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

const content = copy.components.chooseTemplateType;

export const ChooseTemplateType = ({
  templateTypes,
}: {
  templateTypes: TemplateType[];
}) => {
  const [state, action] = useActionState(chooseTemplateTypeAction, {});
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const features = useFeatureFlags();

  const filteredTemplateTypes = features.letterAuthoring
    ? templateTypes
    : templateTypes.filter((type) => type !== 'LETTER');

  const $ChooseTemplateType = features.letterAuthoring
    ? $ChooseTemplateTypeWithLetterAuthoring
    : $ChooseTemplateTypeBase;
  const formValidate = validate($ChooseTemplateType, setErrorState);

  const letterTypes = (
    <Radios
      id='letterType'
      error={errorState?.fieldErrors?.['letterType']?.join(', ')}
      errorProps={{ id: 'letterType--error-message' }}
    >
      {SUPPORTED_LETTER_TYPES.map((letterType) => {
        return (
          <Radios.Radio
            value={letterType}
            id={`letterType-${letterType}`}
            data-testid={`letter-type-${letterType}-radio`}
            key={`letter-type-${letterType}-radio`}
          >
            {content.letterTypes[letterType]}
          </Radios.Radio>
        );
      })}
    </Radios>
  );

  const templateTypeOptions = filteredTemplateTypes.map((templateType) => ({
    id: templateType,
    text: content.templateTypes[templateType],
    conditional:
      templateType === 'LETTER' && features.letterAuthoring
        ? letterTypes
        : undefined,
  }));

  const errorHintText = errorState?.fieldErrors?.['letterType']
    ? content.form.letterType.errorHint
    : content.form.templateType.errorHint;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <NotifyBackLink>{content.backLinkText}</NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <NhsNotifyErrorSummary hint={errorHintText} errorState={errorState} />
        {/* Replacing the NHSNotifyRadioForm on this page with the ChooseTemplateTypeRadios molecule in other to render the callout for uploading letters pending the completion of the letter authoring feature. */}
        <ChooseTemplateTypeRadios
          formId='choose-a-template-type'
          radiosId='templateType'
          action={action}
          state={{ errorState }}
          pageHeading={content.pageHeading}
          options={templateTypeOptions}
          buttonText={content.buttonText}
          hint={content.hint}
          learnMoreLink={content.learnMoreLink}
          learnMoreText={content.learnMoreText}
          formAttributes={{ onSubmit: formValidate }}
        >
          {features.letterAuthoring ? null : (
            <div className='nhsuk-card nhsuk-card--warning nhsuk-u-reading-width'>
              <div className='nhsuk-card__content'>
                <h2 className='nhsuk-card__heading'>
                  {content.warningCalloutContent.headingLabel}
                </h2>
                <p className='nhsuk-card__description nhsuk-u-margin-top-3 nhsuk-u-margin-bottom-6'>
                  {content.warningCalloutContent.firstParagraph}
                </p>
                <p className='nhsuk-card__description'>
                  <MarkdownContent
                    content={content.warningCalloutContent.secondParagraph}
                    mode='inline'
                  />
                </p>
              </div>
            </div>
          )}
        </ChooseTemplateTypeRadios>
      </NHSNotifyMain>
    </>
  );
};
