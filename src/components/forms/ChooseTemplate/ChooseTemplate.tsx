'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import { FC } from 'react';
import { useFormState } from 'react-dom';
import { chooseTemplateAction } from '@forms/ChooseTemplate/server-action';
import { PageComponentProps } from '@utils/types';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { chooseTemplatePageContent } from '@content/content';

export const ChooseTemplate: FC<PageComponentProps> = ({ initialState }) => {
  const [state, action] = useFormState(chooseTemplateAction, initialState);

  const { pageHeading, errorHeading, options, buttonText, hint } =
    chooseTemplatePageContent;

  const optionState = options.map((option) => ({
    ...option,
    checked: state.templateType === option.id,
  }));
  return (
    <>
      <ZodErrorSummary errorHeading={errorHeading} state={state} />
      <NHSNotifyRadioButtonForm
        formId='choose-a-template-type'
        radiosId='templateType'
        action={action}
        state={state}
        pageHeading={pageHeading}
        options={optionState}
        buttonText={buttonText}
        hint={hint}
      />
    </>
  );
};
