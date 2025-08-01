import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = {
  content: string | string[];
};

export function MarkdownContent({ content }: MarkdownContentProps) {
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
          {item}
        </Markdown>
      ))}
    </>
  );
}
