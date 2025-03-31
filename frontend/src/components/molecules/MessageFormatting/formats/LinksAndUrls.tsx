import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import { JSX } from 'react';

const { linksAndUrls } = content.components.messageFormatting;

const LinksAndUrls = ({ children }: { children?: JSX.Element }) => (
  <Details data-testid='link-and-url-details'>
    <Details.Summary data-testid='link-and-url-summary'>
      {linksAndUrls.title}
    </Details.Summary>
    <Details.Text data-testid='link-and-url-text'>
      <p>{linksAndUrls.text1}</p>
      <p>{linksAndUrls.text2}</p>
      <code>{linksAndUrls.codeBlockText.text1}</code>
      {children}
    </Details.Text>
  </Details>
);

export const LinksAndUrlsNoMarkdown = () => <LinksAndUrls />;

export const LinksAndUrlsMarkdown = () => (
  <LinksAndUrls>
    <>
      <p className='nhsuk-u-margin-top-4'>{linksAndUrls.text3}</p>
      <p>{linksAndUrls.text4}</p>
      <code>{linksAndUrls.codeBlockText.text2}</code>
    </>
  </LinksAndUrls>
);
