'use server';

import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import content from '@content/content';
import { MessageTemplates } from '@molecules/MessageTemplates/MessageTemplates';
import { Template } from '@domain/templates';
import { getTemplates } from '@utils/form-actions';

const manageTemplatesContent = content.pages.manageTemplates;

export default async function ManageTemplatesPage() {
  const availableTemplateList: Template[] | [] = await getTemplates();

  return (
    <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
      <div className='nhsuk-grid-column-full'>
        <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
          {manageTemplatesContent.pageHeading}
        </h1>

        <NHSNotifyButton href={manageTemplatesContent.createTemplateButton.url}>
          {manageTemplatesContent.createTemplateButton.text}
        </NHSNotifyButton>

        {availableTemplateList && availableTemplateList.length > 0 ? (
          <MessageTemplates availableTemplateList={availableTemplateList} />
        ) : (
          <p data-testid='no-templates-available'>
            {manageTemplatesContent.emptyTemplates}
          </p>
        )}
      </div>
    </div>
  );
}
