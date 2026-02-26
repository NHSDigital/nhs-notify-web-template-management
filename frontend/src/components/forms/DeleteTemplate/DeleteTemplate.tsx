'use client';

import { FC, useActionState } from 'react';
import content from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import {
  deleteTemplateYesAction,
  deleteTemplateNoAction,
} from './server-action';
import concatClassNames from '@utils/concat-class-names';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

type DeleteTemplateProps = {
  template: TemplateDto;
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
              className: concatClassNames(
                'nhsuk-u-margin-right-3',
                'inline-form'
              ),
            }}
          >
            <NHSNotifyButton data-testid='back-to-templates-link' secondary>
              {noButtonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
          <NHSNotifyFormWrapper
            action={yesAction}
            formAttributes={{ className: 'inline-form' }}
            formId='delete-template-yes'
          >
            <NHSNotifyButton
              className='nhsuk-button--warning'
              data-testid='delete-template-button'
            >
              {yesButtonText}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
};
