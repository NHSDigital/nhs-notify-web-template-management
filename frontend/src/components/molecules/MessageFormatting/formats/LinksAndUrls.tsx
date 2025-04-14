import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import { JSX } from 'react';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { linksAndUrls, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

const LinksAndUrls = ({ children }: { children?: JSX.Element }) => (
  <Details data-testid='link-and-url-details'>
    <Details.Summary data-testid='link-and-url-summary'>
      {linksAndUrls.title}
    </Details.Summary>
    <Details.Text data-testid='link-and-url-text'>
      <p>{linksAndUrls.text1}</p>
      <p>{linksAndUrls.text2}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='link-url-description'
      >
        {linksAndUrls.codeBlockText.text1}
      </CodeExample>
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
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='link-url-markdown-description'
      >
        {linksAndUrls.codeBlockText.text2}
      </CodeExample>
    </>
  </LinksAndUrls>
);
