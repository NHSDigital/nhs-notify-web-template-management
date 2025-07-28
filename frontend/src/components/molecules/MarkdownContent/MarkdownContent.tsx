import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = { segments: string[] };

export function MarkdownContent({ segments }: MarkdownContentProps) {
  return (
    <>
      {segments.map((content, index) => {
        return (
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
            {content}
          </Markdown>
        );
      })}
    </>
  );
}
