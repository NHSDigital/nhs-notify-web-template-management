import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import content from '@content/content';
import { Metadata } from 'next';
import { NHSNotifyContainer } from '@layouts/container/container';

const homePageContent = content.pages.homePage;

export const metadata: Metadata = {
  title: homePageContent.pageTitle,
};

export default function HomePage() {
  return (
    <NHSNotifyContainer>
      <NHSNotifyMain>
        <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
          <div className='nhsuk-grid-column-two-thirds'>
            <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
              {homePageContent.pageHeading}
            </h1>

            <p>{homePageContent.text1}</p>
            <p>{homePageContent.text2}</p>

            <ul className='nhsuk-list nhsuk-list--bullet'>
              {homePageContent.channelList.map((channel, i) => (
                <li key={`template${i + 1}`}>{channel}</li>
              ))}
            </ul>

            <p>{homePageContent.text3}</p>
            <h2 className='nhsuk-heading-l' data-testid='page-sub-heading'>
              {homePageContent.pageSubHeading}
            </h2>
            <p>{homePageContent.text4}</p>
            <p>{homePageContent.text5}</p>
            <p>{homePageContent.text6}</p>
            <p>{homePageContent.text7}</p>

            <NHSNotifyButton
              href={homePageContent.linkButton.url}
              data-testid='start-now-button'
            >
              {homePageContent.linkButton.text}
            </NHSNotifyButton>
          </div>
        </div>
      </NHSNotifyMain>
    </NHSNotifyContainer>
  );
}
