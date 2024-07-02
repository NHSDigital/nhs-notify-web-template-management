import { MarkdownItWrapper } from '@/src/utils/markdownit';
import { FormState } from '@utils/types';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}

export function handleForm(state: FormState, _data: FormData) {
  return { ...state };
}
