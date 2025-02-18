'use client';

import { FC } from 'react';
import { useFormState } from 'react-dom';
import { ChannelTemplate } from 'nhs-notify-web-template-management-utils';
import { deleteTemplatePageContent } from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from './server-action';

type DeleteTemplateProps = {
  template: ChannelTemplate;
};

export const DeleteTemplate: FC<DeleteTemplateProps> = ({ template }) => {
  const { pageHeading, hintText, noButtonText, yesButtonText } =
    deleteTemplatePageContent;

  const [state, action] = useFormState(deleteTemplateYesAction, template);

  const fullPageHeading = `${pageHeading} '${state.name}'?`;
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-l'>{fullPageHeading}</h1>
          <p>{hintText}</p>
          <NHSNotifyFormWrapper
            action={deleteTemplateNoAction}
            formId='delete-template-no'
            formAttributes={{
              className: 'nhsuk-u-margin-right-3',
              style: { display: 'inline' },
            }}
          >
            <NHSNotifyButton secondary>{noButtonText}</NHSNotifyButton>
          </NHSNotifyFormWrapper>
          <NHSNotifyFormWrapper
            action={action}
            formAttributes={{ style: { display: 'inline' } }}
            formId='delete-template-yes'
          >
            <NHSNotifyButton className='nhsuk-button--warning'>
              {yesButtonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
