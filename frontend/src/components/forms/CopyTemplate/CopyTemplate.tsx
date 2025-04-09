'use client';

import { useActionState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import content from '@content/content';
import { templateTypeDisplayMappings } from 'nhs-notify-web-template-management-utils';
import { getBasePath } from '@utils/get-base-path';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { copyTemplateAction } from './server-action';
import { TemplateType, ValidatedTemplateDto } from 'nhs-notify-backend-client';

export type ValidCopyType = Exclude<TemplateType, 'LETTER'>;

type CopyTemplate = {
  template: ValidatedTemplateDto & { templateType: ValidCopyType };
};

export const CopyTemplate = ({ template }: CopyTemplate) => {
  const copyTypes = ['NHS_APP', 'EMAIL', 'SMS'] as const;

  const [state, action] = useActionState(copyTemplateAction, { template });

  const options = copyTypes.map((templateType) => ({
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
  } = content.components.copyTemplate;

  const fullPageHeading = `${pageHeading} '${template.name}'`;

  return (
    <>
      <BackLink id='back-link' href={`${getBasePath()}/message-templates`}>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
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
      </NHSNotifyMain>
    </>
  );
};
