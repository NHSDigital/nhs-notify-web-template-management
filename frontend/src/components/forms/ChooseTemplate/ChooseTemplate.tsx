'use client';

import { useActionState, useState } from 'react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import content from '@content/content';
import {
  ErrorState,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $ChooseTemplate, chooseTemplateAction } from './server-action';
import { TemplateType } from 'nhs-notify-backend-client';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export const ChooseTemplate = ({
  templateTypes,
}: {
  templateTypes: TemplateType[];
}) => {
  const [state, action] = useActionState(chooseTemplateAction, {});
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($ChooseTemplate, setErrorState);

  const options = templateTypes.map((templateType) => ({
    id: templateType,
    text: templateTypeDisplayMappings(templateType),
  }));

  const {
    pageHeading,
    buttonText,
    hint,
    learnMoreLink,
    learnMoreText,
    backLinkText,
  } = content.components.chooseTemplate;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <NotifyBackLink data-testid='back-to-templates-link'>
          {backLinkText}
        </NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <NhsNotifyErrorSummary errorState={errorState} />
        <NHSNotifyRadioButtonForm
          formId='choose-a-template-type'
          radiosId='templateType'
          action={action}
          state={{ errorState }}
          pageHeading={pageHeading}
          options={options}
          buttonText={buttonText}
          hint={hint}
          learnMoreLink={learnMoreLink}
          learnMoreText={learnMoreText}
          formAttributes={{ onSubmit: formValidate }}
        />
      </NHSNotifyMain>
    </>
  );
};
