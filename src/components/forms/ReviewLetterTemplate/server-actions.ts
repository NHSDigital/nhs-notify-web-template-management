import { FormState } from '@/src/utils/types';
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

export function handleForm(state: FormState, _form: FormData) {
  return { ...state };
}
