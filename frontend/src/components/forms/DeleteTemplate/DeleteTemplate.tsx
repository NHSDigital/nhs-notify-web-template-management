'use client';

import { FC, useActionState } from 'react';
import { Template } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from './server-action';

type DeleteTemplateProps = {
  template: Template;
};

export const DeleteTemplate: FC<DeleteTemplateProps> = ({ template }) => {
  const { pageHeading, hintText, noButtonText, yesButtonText } =
    content.components.deleteTemplate;

  const [yesState, yesAction] = useActionState(
    deleteTemplateYesAction,
    template
  );
  const [_, noAction] = useActionState(deleteTemplateNoAction, null);

  const fullPageHeading = `${pageHeading} '${yesState.name}'?`;
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-l'>{fullPageHeading}</h1>
          <p>{hintText}</p>
          <NHSNotifyFormWrapper
            action={noAction}
            formId='delete-template-no'
            formAttributes={{
              className: 'nhsuk-u-margin-right-3',
              style: { display: 'inline' },
            }}
          >
            <NHSNotifyButton secondary>{noButtonText}</NHSNotifyButton>
          </NHSNotifyFormWrapper>
          <NHSNotifyFormWrapper
            action={yesAction}
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
