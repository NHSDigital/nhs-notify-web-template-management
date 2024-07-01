import { MarkdownItWrapper } from '@utils/markdownit';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  return markdown.render(value);
}
