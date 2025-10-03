import { interpolate } from '@utils/interpolate';
import Markdown from 'markdown-to-jsx';
import React from 'react';

type MarkdownContentProps = {
  content: string | string[];
  variables?: Record<string, string | number>;
  testId?: string;
  mode?: 'block' | 'inline';
};

export function MarkdownContent({
  content,
  variables,
  testId,
  mode = 'block',
}: MarkdownContentProps) {
  const items = Array.isArray(content) ? content : [content];

  const rendered = items
    .map((item) => interpolate(item, variables))
    .filter((s) => s.trim().length > 0);

  if (rendered.length === 0) return null;

  const modeOption =
    mode === 'block' ? ({ forceBlock: true } as const) : ({ forceInline: true } as const);

  return (
    <>
      {rendered.map((item, index) => (
        <Markdown
          key={index}
          data-testid={testId ? `${testId}-${index}` : undefined}
          options={{
            wrapper: React.Fragment,
            disableParsingRawHTML: true,
            overrides: {
              a: {
                component: 'a',
                props: { rel: 'noopener noreferrer', target: '_blank' },
              },
            },
            ...modeOption
          }}
        >
          {item}
        </Markdown >
      ))
      }
    </>
  );
}
