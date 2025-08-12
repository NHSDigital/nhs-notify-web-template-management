import CodeExample from '@atoms/CodeExample/CodeExample';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

type StandardBlock = { testId?: string };
export type MarkdownTextBlock = StandardBlock & { type: 'text'; text: string };
export type CodeBlock = StandardBlock & {
  type: 'code';
  code: string;
  aria: { text: string; id: string };
};
export type ListBlock = StandardBlock & { type: 'list'; items: string[] };

export type ContentBlock = MarkdownTextBlock | CodeBlock | ListBlock;

interface ContentRendererProps {
  content: ContentBlock[];
  variables?: Record<string, string | number>;
}

export function ContentRenderer({ content, variables }: ContentRendererProps) {
  return (
    <>
      {content.map((block, index) => {
        const key = block.testId ?? index;

        switch (block.type) {
          case 'text':
            return (
              <MarkdownContent
                testId={block.testId}
                key={key}
                content={block.text}
                variables={variables}
              />
            );
          case 'code':
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
          case 'list':
            return (
              <ul data-testid={block.testId} key={key}>
                {block.items.map((item, itemId) => (
                  <li key={itemId}>{item}</li>
                ))}
              </ul>
            );
          default:
            console.error('Unsupported content block:', block);

            throw new Error('Unsupported content block type');
        }
      })}
    </>
  );
}
