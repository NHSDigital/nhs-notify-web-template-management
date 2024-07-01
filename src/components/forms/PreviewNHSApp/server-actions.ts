import { MarkdownItWrapper } from '@/src/utils/markdownit';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}
