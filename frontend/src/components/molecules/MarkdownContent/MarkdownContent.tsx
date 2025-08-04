import { interpolate } from '@utils/interpolate';
import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = {
  content: string | string[];
  variables?: Record<string, string | number>;
  id?: string;
  testId?: string;
};

export function MarkdownContent({
  content,
  variables,
  id,
  testId,
}: MarkdownContentProps) {
  const items = Array.isArray(content) ? content : [content];

  return (
    <>
      {items.map((item, index) => (
        <Markdown
          key={index}
          {...(id ? { id: items.length > 1 ? `${id}-${index}` : id } : {})}
          {...(testId
            ? {
                'data-testid': items.length > 1 ? `${testId}-${index}` : testId,
              }
            : {})}
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
