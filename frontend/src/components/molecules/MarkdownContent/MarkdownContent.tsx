import React from 'react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import { interpolate } from '@utils/interpolate';

type MarkdownContentProps = {
  content: string | string[];
  variables?: Record<string, string | number>;
  testId?: string;
  mode?: 'block' | 'inline';
  overrides?: MarkdownToJSX.Overrides;
};

export function MarkdownContent({
  content,
  variables,
  testId,
  mode = 'block',
  overrides,
}: MarkdownContentProps) {
  const items = Array.isArray(content) ? content : [content];

  const rendered = items
    .map((item) => interpolate(item, variables))
    .filter((s) => s.trim().length > 0);

  if (rendered.length === 0) return null;

  const NoWrap = ({ children }: React.PropsWithChildren) => <>{children}</>;

  const inlineOptions: MarkdownToJSX.Options = {
    wrapper: React.Fragment,
    forceInline: true,
    disableParsingRawHTML: true,
    overrides: {
      a: {
        component: 'a',
        props: { target: '_blank', rel: 'noopener noreferrer' },
      },
      span: { component: NoWrap },
      ...overrides,
    },
  };

  const blockOptions: MarkdownToJSX.Options = {
    wrapper: React.Fragment,
    forceBlock: true,
    disableParsingRawHTML: true,
    overrides: {
      a: {
        component: 'a',
        props: { target: '_blank', rel: 'noopener noreferrer' },
      },
      ...overrides,
    },
  };

  return (
    <>
      {rendered.map((item, index) => (
        <Markdown
          key={index}
          data-testid={testId ? `${testId}-${index}` : undefined}
          options={mode === 'block' ? blockOptions : inlineOptions}
        >
          {item}
        </Markdown>
      ))}
    </>
  );
}
