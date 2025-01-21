'use client';

import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { getBasePath } from '@utils/get-base-path';
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
    backLinkText,
  } = chooseTemplatePageContent;

  return (
    <>
      <div className='nhsuk-grid-row'>
        <BackLink
          href={`${getBasePath()}/manage-templates`}
          className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-left-3'
        >
          {backLinkText}
        </BackLink>
      </div>
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
