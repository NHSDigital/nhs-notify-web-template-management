'use client';

import { useActionState, useState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import content from '@content/content';
import {
  FormErrorState,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $ChooseTemplate, chooseTemplateAction } from './server-action';
import { TemplateType } from 'nhs-notify-backend-client';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';

export const ChooseTemplate = ({
  templateTypes,
}: {
  templateTypes: TemplateType[];
}) => {
  const [state, action] = useActionState(chooseTemplateAction, {});
  const [validationError, setValidationError] = useState<
    FormErrorState | undefined
  >(state.validationError);

  const formValidate = validate($ChooseTemplate, setValidationError);

  const options = templateTypes.map((templateType) => ({
    id: templateType,
    text: templateTypeDisplayMappings(templateType),
  }));

  const {
    pageHeading,
    errorHeading,
    buttonText,
    hint,
    learnMoreLink,
    learnMoreText,
    backLinkText,
  } = content.components.chooseTemplate;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <BackLink data-testid='back-to-templates-link'>{backLinkText}</BackLink>
      </Link>
      <NHSNotifyMain>
        <ZodErrorSummary
          errorHeading={errorHeading}
          state={{ validationError }}
        />
        <NHSNotifyRadioButtonForm
          formId='choose-a-template-type'
          radiosId='templateType'
          action={action}
          state={{ validationError }}
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
