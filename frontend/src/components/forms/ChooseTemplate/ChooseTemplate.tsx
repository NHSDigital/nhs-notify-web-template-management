'use client';

import { useActionState } from 'react';
import { BackLink } from 'nhsuk-react-components';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { templateTypeDisplayMappings } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { chooseTemplateAction } from './server-action';
import { TemplateType } from 'nhs-notify-backend-client';

export const ChooseTemplate = ({
  templateTypes,
}: {
  templateTypes: TemplateType[];
}) => {
  const [state, action] = useActionState(chooseTemplateAction, {});

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
      <BackLink href={`${getBasePath()}/message-templates`}>
        {backLinkText}
      </BackLink>
      <NHSNotifyMain>
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
      </NHSNotifyMain>
    </>
  );
};
