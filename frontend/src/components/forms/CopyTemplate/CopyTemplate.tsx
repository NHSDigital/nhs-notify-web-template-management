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
import { $CopyTemplate, copyTemplateAction } from './server-action';
import { TemplateDto, TemplateType } from 'nhs-notify-backend-client';
import { validate } from '@utils/client-validate-form';
import Link from 'next/link';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

export type ValidCopyType = Exclude<TemplateType, 'LETTER'>;

type CopyTemplate = {
  template: TemplateDto & { templateType: ValidCopyType };
};

export const CopyTemplate = ({ template }: CopyTemplate) => {
  const copyTypes = ['NHS_APP', 'EMAIL', 'SMS'] as const;

  const [state, action] = useActionState(copyTemplateAction, { template });

  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($CopyTemplate, setErrorState);

  const options = copyTypes.map((templateType) => ({
    id: templateType,
    text: templateTypeDisplayMappings(templateType),
  }));

  const { buttonText, hint, pageHeading, radiosLabel, backLinkText } =
    content.components.copyTemplate;

  const fullPageHeading = `${pageHeading} '${template.name}'`;

  return (
    <>
      <Link href='/message-templates' passHref legacyBehavior>
        <NotifyBackLink>{backLinkText}</NotifyBackLink>
      </Link>
      <NHSNotifyMain>
        <NhsNotifyErrorSummary errorState={errorState} />
        <div className='nhsuk-grid-row'>
          <div className='nhsuk-grid-column-two-thirds'>
            <h1 className='nhsuk-heading-xl'>{fullPageHeading}</h1>
            <NHSNotifyRadioButtonForm
              formId='choose-a-template-type'
              radiosId='templateType'
              action={action}
              state={{ errorState }}
              pageHeading={radiosLabel}
              options={options}
              buttonText={buttonText}
              hint={hint}
              formAttributes={{ onSubmit: formValidate }}
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
