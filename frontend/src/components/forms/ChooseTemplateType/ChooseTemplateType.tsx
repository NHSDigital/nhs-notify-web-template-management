'use client';

import { useActionState, useState } from 'react';
import { Radios } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
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
import { TemplateType } from 'nhs-notify-backend-client';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';
import { useFeatureFlags } from '@providers/client-config-provider';

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

  const $ChooseTemplateType = features.letterAuthoring
    ? $ChooseTemplateTypeWithLetterAuthoring
    : $ChooseTemplateTypeBase;
  const formValidate = validate($ChooseTemplateType, setErrorState);

  const content = copy.components.chooseTemplateType;

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

  const templateTypeOptions = templateTypes.map((templateType) => ({
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
        <NHSNotifyRadioButtonForm
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
        />
      </NHSNotifyMain>
    </>
  );
};
