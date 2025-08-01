import { interpolate } from '@utils/interpolate';
import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = {
  content: string | string[];
  variables?: Record<string, string | number>;
}

export function MarkdownContent({ content, variables }: MarkdownContentProps) {
  const items = Array.isArray(content) ? content : [content];

  return (
    <>
      {items.map((item, index) => (
        <Markdown
          key={index}
          options={{
            forceBlock: true,
            wrapper: React.Fragment,
            disableParsingRawHTML: true,
            overrides: {
              a: {
                component: 'a',
                props: {
                  rel: 'noopener noreferrer',
                  target: '_blank',
                },
              },
            },
          }}
        >
          {interpolate(item, variables)}
        </Markdown>
      ))}
    </>
  );
}
