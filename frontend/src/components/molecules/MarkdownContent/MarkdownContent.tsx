// import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = { segments: string[] };

export function MarkdownContent({ segments }: MarkdownContentProps) {
  return (
    <>
      {segments.map((content, index) => {
        return (
          // <ReactMarkdown
          //   key={index}
          //   children={content}
          //   allowedElements={['a', 'p']}
          //   components={{
          //     a(props) {
          //       const { node, ...rest } = props;
          //       return (
          //         <a {...rest} target='_blank' rel='noopener noreferrer' />
          //       );
          //     },
          //   }}
          // />
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
