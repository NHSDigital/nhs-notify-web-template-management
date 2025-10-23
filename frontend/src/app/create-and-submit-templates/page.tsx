import DocxExtract from '@atoms/DocxExtract/DocxExtract';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { Metadata } from 'next';

const homePageContent = content.pages.homePage;

export const metadata: Metadata = {
  title: homePageContent.pageTitle,
};

export default function HomePage() {
  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
            {homePageContent.pageHeading}
          </h1>
          <DocxExtract />
          <br />
          <br />
          <NHSNotifyButton
            href={homePageContent.linkButton.url}
            data-testid='start-now-button'
          >
            {homePageContent.linkButton.text}
          </NHSNotifyButton>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
