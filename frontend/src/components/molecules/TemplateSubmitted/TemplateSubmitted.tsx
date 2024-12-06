import Link from 'next/link';
import { templateSubmittedPageContent } from '@content/content';

type TemplateSubmittedProps = {
  templateId: string;
  templateName: string;
};

export const TemplateSubmitted = ({
  templateId,
  templateName,
}: TemplateSubmittedProps) => {
  const {
    pageHeading,
    templateNameHeading,
    templateIdHeading,
    newTemplateText,
    doNextHeading,
    doNextText,
    notLiveHeading,
    notLiveText,
    liveHeading,
    liveLinkText,
    liveText,
  } = templateSubmittedPageContent;

  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-two-thirds'>
        <div className='notify-confirmation-panel'>
          <h1
            id='template-submitted'
            className='nhsuk-heading-l nhsuk-u-margin-bottom-0'
          >
            {pageHeading}
          </h1>
        </div>
        <h2 className='nhsuk-heading-xs nhsuk-u-margin-bottom-1'>
          {templateNameHeading}
        </h2>
        <p id='template-name'>{templateName}</p>
        <h2 className='nhsuk-heading-xs nhsuk-u-margin-bottom-1'>
          {templateIdHeading}
        </h2>
        <p id='template-id'>{templateId}</p>
        <Link id='create-another-template' href='/choose-a-template-type'>
          {newTemplateText}
        </Link>
        <h2 className='nhsuk-u-margin-top-5'>{doNextHeading}</h2>
        <p>{doNextText}</p>
        <h3>{notLiveHeading}</h3>
        <p>{notLiveText}</p>
        <h3>{liveHeading}</h3>
        <p>
          {liveText}{' '}
          <Link
            id='servicenow-link'
            href='https://nhsdigitallive.service-now.com/nhs_digital?id=sc_cat_item&sys_id=6208dbce1be759102eee65b9bd4bcbf5'
            target='_blank'
            rel='noopener noreferrer'
          >
            {liveLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
};
