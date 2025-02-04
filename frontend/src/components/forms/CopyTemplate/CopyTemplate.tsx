'use client';

// we need this to be a client component because nhsuk-react-components uses client-only react features

import { useFormState } from 'react-dom';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { copyTemplatePageContent } from '@content/content';
import {
  Template,
  TemplateType,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { copyTemplateAction } from './server-action';

type CopyTemplate = {
  template: Template;
};

export const CopyTemplate = ({ template }: CopyTemplate) => {
  const [state, action] = useFormState(copyTemplateAction, { template });

  const templateTypes = Object.values(TemplateType);
  const options = templateTypes.map((templateType) => ({
    id: templateType,
    text: templateTypeDisplayMappings(templateType),
  }));

  const {
    errorHeading,
    buttonText,
    hint,
    pageHeading,
    radiosLabel,
    backLinkText,
  } = copyTemplatePageContent;

  const fullPageHeading = `${pageHeading} '${template.name}'`;

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <BackLink
          id='back-link'
          href={`${getBasePath()}/manage-templates`}
          className='nhsuk-u-margin-bottom-5'
        >
          {backLinkText}
        </BackLink>
        <h1 className='nhsuk-heading-xl'>{fullPageHeading}</h1>
        <ZodErrorSummary errorHeading={errorHeading} state={state} />
        <NHSNotifyRadioButtonForm
          formId='choose-a-template-type'
          radiosId='templateType'
          action={action}
          state={state}
          pageHeading={radiosLabel}
          options={options}
          buttonText={buttonText}
          hint={hint}
          legend={{
            isPgeHeading: false,
            size: 'm',
          }}
        />
      </div>
    </div>
  );
};
