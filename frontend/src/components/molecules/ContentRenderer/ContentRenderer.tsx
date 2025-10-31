import type { MarkdownToJSX } from 'markdown-to-jsx';
import CodeExample from '@atoms/CodeExample/CodeExample';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

type StandardBlock = { testId?: string };

export type MarkdownTextBlock = StandardBlock & {
  type: 'text';
  text: string;
  overrides?: MarkdownToJSX.Overrides;
};

export type MarkdownInlineBlock = StandardBlock & {
  type: 'inline-text';
  text: string;
  overrides?: MarkdownToJSX.Overrides;
};

export type CodeBlock = StandardBlock & {
  type: 'code';
  code: string;
  aria: { text: string; id: string };
};

export type ContentBlock = MarkdownTextBlock | MarkdownInlineBlock | CodeBlock;
export type ContentItem = ContentBlock | string;

interface ContentRendererProps {
  content: ContentItem[] | string;
  variables?: Record<string, string | number>;
}

export function ContentRenderer({ content, variables }: ContentRendererProps) {
  const items: ContentItem[] =
    typeof content === 'string' ? [content] : content;
  if (items.length === 0) return null;

  return (
    <>
      {items.map((block, index) => {
        if (typeof block === 'string') {
          return (
            <MarkdownContent
              key={index}
              content={block}
              variables={variables}
              mode='inline'
            />
          );
        }

        const key = block.testId ?? index;

        switch (block.type) {
          case 'text': {
            return (
              <MarkdownContent
                key={key}
                testId={block.testId}
                content={block.text}
                variables={variables}
                overrides={block.overrides}
                mode='block'
              />
            );
          }
          case 'inline-text': {
            return (
              <MarkdownContent
                key={key}
                testId={block.testId}
                content={block.text}
                variables={variables}
                overrides={block.overrides}
                mode='inline'
              />
            );
          }
          case 'code': {
            return (
              <CodeExample
                data-testid={block.testId}
                key={key}
                ariaText={block.aria?.text}
                ariaId={block.aria?.id}
              >
                {block.code}
              </CodeExample>
            );
          }
          default: {
            console.error('Unsupported content block:', block);

            throw new Error('Unsupported content block type');
          }
        }
      })}
    </>
  );
}
