import { FormState } from '@utils/types';
import { MarkdownItWrapper } from '@utils/markdownit';

export function renderMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  return markdown.render(value);
}

export function handleForm(state: FormState, _data: FormData) {
  return { ...state };
}
