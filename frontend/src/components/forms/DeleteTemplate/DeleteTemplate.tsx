'use client';

import { FC, useActionState } from 'react';
import { ChannelTemplate } from 'nhs-notify-web-template-management-utils';
import { deleteTemplatePageContent } from '@content/content';
import { Button } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import { deleteTemplateAction } from './server-action';

type DeleteTemplateProps = {
  template: ChannelTemplate;
};

export const DeleteTemplate: FC<DeleteTemplateProps> = ({ template }) => {
  const { pageHeading, hintText, noButtonText, yesButtonText } =
    deleteTemplatePageContent;

  const [state, action] = useActionState(deleteTemplateAction, template);

  const fullPageHeading = `${pageHeading} '${state.name}'?`;
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <h1 className='nhsuk-heading-l'>{fullPageHeading}</h1>
        <p>{hintText}</p>
        <form
          action={`${getBasePath()}/manage-templates`}
          className='nhsuk-u-margin-right-3'
          style={{ display: 'inline' }}
        >
          <Button secondary>{noButtonText}</Button>
        </form>
        <form action={action} style={{ display: 'inline' }}>
          <Button className='nhsuk-button--warning'>{yesButtonText}</Button>
        </form>
      </div>
    </div>
  );
};
