'use client'; // we need this to be a client component because nhsuk-react-components uses client-only react features
import { FC } from 'react';
import { PageComponentProps } from '../../../utils/types';
import { NHSNotifyRadioButtonForm } from '../../molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '../../molecules/ZodErrorSummary/ZodErrorSummary';
import { chooseTemplatePageContent } from '../../../content/content';

export const ChooseTemplate: FC<PageComponentProps> = ({ state, action }) => {
  const { pageHeading, errorHeading, options, buttonText } =
    chooseTemplatePageContent;
  return (
    <>
      <ZodErrorSummary errorHeading={errorHeading} state={state} />
      <NHSNotifyRadioButtonForm
        formId='choose-template'
        radiosId='page'
        action={action}
        state={state}
        pageHeading={pageHeading}
        options={options}
        buttonText={buttonText}
      />
    </>
  );
};
