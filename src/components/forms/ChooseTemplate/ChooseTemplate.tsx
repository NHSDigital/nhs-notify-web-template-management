'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import { useFormState } from 'react-dom';
import { chooseTemplateAction } from '@forms/ChooseTemplate/server-action';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { chooseTemplatePageContent } from '@content/content';
import { FormState } from '@utils/types';

export const ChooseTemplate = () => {
  const initialState: FormState = {};
  const [state, action] = useFormState(chooseTemplateAction, initialState);

  const {
    pageHeading,
    errorHeading,
    options,
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
