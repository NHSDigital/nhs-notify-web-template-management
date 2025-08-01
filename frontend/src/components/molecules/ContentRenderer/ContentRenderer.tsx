import CodeExample from '@atoms/CodeExample/CodeExample';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

export type MarkdownTextBlock = { type: 'text'; text: string };
export type CodeBlock = {
  type: 'code';
  code: string;
  aria: { text: string; id: string };
};
export type ListBlock = { type: 'list'; items: string[] };

export type ContentBlock = MarkdownTextBlock | CodeBlock | ListBlock;

interface ContentRendererProps {
  content: ContentBlock[];
}

export function ContentRenderer({ content }: ContentRendererProps) {
  return (
    <>
      {content.map((block, index) => {
        switch (block.type) {
          case 'text':
            return <MarkdownContent key={index} content={block.text} />;
          case 'code':
            return (
              <CodeExample
                key={index}
                ariaText={block.aria?.text}
                ariaId={block.aria?.id}
              >
                {block.code}
              </CodeExample>
            );
          case 'list':
            return (
              <ul key={index}>
                {block.items.map((item, itemId) => (
                  <li key={itemId}>{item}</li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
