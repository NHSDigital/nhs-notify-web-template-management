import type { MarkdownToJSX } from 'markdown-to-jsx';
import CodeExample from '@atoms/CodeExample/CodeExample';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

export type MarkdownTextBlock = {
  type: 'text';
  text: string;
  overrides?: MarkdownToJSX.Overrides;
};

export type MarkdownInlineBlock = {
  type: 'inline-text';
  text: string;
  overrides?: MarkdownToJSX.Overrides;
};

export type CodeBlock = {
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

        switch (block.type) {
          case 'text': {
            return (
              <MarkdownContent
                key={index}
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
                key={index}
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
                key={index}
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
