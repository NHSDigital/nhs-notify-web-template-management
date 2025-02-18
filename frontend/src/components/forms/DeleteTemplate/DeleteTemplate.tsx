'use client';

import { FC, useActionState } from 'react';
import { ChannelTemplate } from 'nhs-notify-web-template-management-utils';
import { deleteTemplatePageContent } from '@content/content';
import { Button } from 'nhsuk-react-components';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
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
            <Button secondary>{noButtonText}</Button>
          </NHSNotifyFormWrapper>
          <NHSNotifyFormWrapper
            action={yesAction}
            formAttributes={{ style: { display: 'inline' } }}
            formId='delete-template-yes'
          >
            <Button className='nhsuk-button--warning'>{yesButtonText}</Button>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
