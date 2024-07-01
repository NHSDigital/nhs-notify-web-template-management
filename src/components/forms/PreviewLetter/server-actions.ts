import { MarkdownItWrapper } from '@utils/markdownit';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown
    .enableLineBreak()
    .enablePageBreak()
    .enable(['heading', 'list', 'emphasis']);

  return markdown.render(value);
}
