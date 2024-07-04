import { FormState } from '@utils/types';
import { MarkdownItWrapper } from '@utils/markdownit';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'hr']);

  return markdown.render(value);
}

export function handleForm(state: FormState, _data: FormData) {
  return { ...state };
}
