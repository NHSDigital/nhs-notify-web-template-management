'use client'; // we need this to be a client component because nhsuk-react-components uses client-only react features
import {
  Radios,
  Button,
  ErrorSummary,
  ErrorMessage,
} from 'nhsuk-react-components';
import { useFormState } from 'react-dom';
import { chooseTemplateServerAction } from './choose-template-server-action';
import { FormState } from '../../utils/types';
import { NHSNotifyRadioButtonForm } from '../../components/molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '../../components/molecules/ZodErrorSummary/ZodErrorSummary';
import { chooseTemplatePageContent } from '../../content/content';

export default function ChooseTemplatePage() {
  const { pageHeading, errorHeading, options, buttonText } =
    chooseTemplatePageContent;
  const [state, action] = useFormState<FormState, FormData>(
    chooseTemplateServerAction,
    { formErrors: [], fieldErrors: {} }
  );
  return (
    <>
      <ZodErrorSummary errorHeading={errorHeading} state={state} />
      <NHSNotifyRadioButtonForm
        radiosId='choose-template'
        action={action}
        state={state}
        pageHeading={pageHeading}
        options={options}
        buttonText={buttonText}
      />
    </>
  );
}
