import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { NHSNotifyContainer } from '@layouts/container/container';
import { MessageTemplates } from '@molecules/MessageTemplates/MessageTemplates';
import { getTemplates } from '@utils/form-actions';
import { Metadata } from 'next';

// Note: force this page to be dynamically rendered
// This is because Next defaults this page as a static rendered page
// which causes a build failure due to getTemplates attempting to get a server-side session via cookies and failing
// The other pages which do similar thing expect a templateId parameter
// Which informs next it needs to be dynamically rendered
export const dynamic = 'force-dynamic';

const messageTemplatesContent = content.pages.messageTemplates;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: messageTemplatesContent.pageTitle,
  };
}

export default async function MessageTemplatesPage() {
  const availableTemplateList = await getTemplates();

  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
          <div className='nhsuk-grid-column-full'>
            <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
              {messageTemplatesContent.pageHeading}
            </h1>

            <NHSNotifyButton
              data-testid='create-template-button'
              id='create-template-button'
              href={messageTemplatesContent.createTemplateButton.url}
            >
              {messageTemplatesContent.createTemplateButton.text}
            </NHSNotifyButton>

            {availableTemplateList && availableTemplateList.length > 0 ? (
              <MessageTemplates templateList={availableTemplateList} />
            ) : (
              <p
                id='no-templates-available'
                data-testid='no-templates-available'
              >
                {messageTemplatesContent.emptyTemplates}
              </p>
            )}
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
