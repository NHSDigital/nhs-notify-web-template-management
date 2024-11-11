import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import content from '@content/content';
import {
  getAllMessageTemplatesAction,
  MessageTemplates,
} from '@molecules/MessageTemplates';
import { Template } from '@domain/templates';

const manageTemplatesContent = content.pages.manageTemplates;

export default async function ManageTemplatesPage() {
  const list: Template[] | undefined = await getAllMessageTemplatesAction();
  return (
    <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
      <div className='nhsuk-grid-column-full'>
        <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
          {manageTemplatesContent.pageHeading}
        </h1>

        <NHSNotifyButton href={manageTemplatesContent.createTemplateButton.url}>
          {manageTemplatesContent.createTemplateButton.text}
        </NHSNotifyButton>

        <MessageTemplates list={list} />

        <p>{manageTemplatesContent.emptyTemplates}</p>
      </div>
    </div>
  );
}
