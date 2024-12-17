'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import { useFormState } from 'react-dom';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { chooseTemplatePageContent } from '@content/content';
import {
  TemplateType,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import { chooseTemplateAction } from './server-action';

export const ChooseTemplate = () => {
  const [state, action] = useFormState(chooseTemplateAction, {});

  const templateTypes = Object.values(TemplateType);
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
  } = chooseTemplatePageContent;

  return (
    <>
      <ZodErrorSummary errorHeading={errorHeading} state={state} />
      <NHSNotifyRadioButtonForm
        formId='choose-a-template-type'
        radiosId='templateType'
        action={action}
        state={state}
        pageHeading={pageHeading}
        options={options}
        buttonText={buttonText}
        hint={hint}
        learnMoreLink={learnMoreLink}
        learnMoreText={learnMoreText}
      />
    </>
  );
};
