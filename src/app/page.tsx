'use client';

import { NHSNotifyButton } from '@/src/components/atoms/NHSNotifyButton/NHSNotifyButton';
import content from '@/src/content/content';

const homePageContent = content.pages.homePage;

export default function HomePage() {
  return (
    <div className='nhsuk-grid-row' data-testid='page-content-wrapper'>
      <div className='nhsuk-grid-column-two-thirds'>
        <h1 className='nhsuk-heading-xl' data-testid='page-heading'>
          {homePageContent.pageHeading}
        </h1>

        <p>{homePageContent.text1}</p>
        <p>{homePageContent.text2}</p>

        <ul className='nhsuk-list nhsuk-list--bullet'>
          {homePageContent.list.map(({ key, item }) => (
            <li key={key}>{item}</li>
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

        <NHSNotifyButton href={homePageContent.linkButton.url}>
          {homePageContent.linkButton.text}
        </NHSNotifyButton>
      </div>
    </div>
  );
}
