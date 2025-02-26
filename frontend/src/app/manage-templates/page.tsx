import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { ManageTemplates } from '@molecules/ManageTemplates/ManageTemplates';
import { getTemplates } from '@utils/form-actions';

// Note: force this page to be dynamically rendered
// This is because Next defaults this page as a static rendered page
// which causes a build failure due to getTemplates attempting to get a server-side session via cookies and failing
// The other pages which do similar thing expect a templateId parameter
// Which informs next it needs to be dynamically rendered
export const dynamic = 'force-dynamic';

const manageTemplatesContent = content.pages.manageTemplates;

export default async function ManageTemplatesPage() {
  const availableTemplateList = await getTemplates();

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-full'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {manageTemplatesContent.pageHeading}
          </h1>

          <NHSNotifyButton
            id='create-template-button'
            href={manageTemplatesContent.createTemplateButton.url}
          >
            {manageTemplatesContent.createTemplateButton.text}
          </NHSNotifyButton>

          {availableTemplateList && availableTemplateList.length > 0 ? (
            <ManageTemplates templateList={availableTemplateList} />
          ) : (
            <p id='no-templates-available' data-testid='no-templates-available'>
              {manageTemplatesContent.emptyTemplates}
            </p>
          )}
        </div>
      </div>
    </NHSNotifyMain>
  );
}
