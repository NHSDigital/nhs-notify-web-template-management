import MarkdownIt from 'markdown-it';
import { lineBreak } from './plugins/line-break';
import { pageBreak } from './plugins/page-break';

type MarkdownItWrapperProps = {
  enableLineBreaks?: boolean;
  enablePageBreak?: boolean;
};

export const MarkdownItWrapper = (
  opts: MarkdownItWrapperProps = {
    enableLineBreaks: true,
    enablePageBreak: false,
  }
) => {
  const markdownIt = new MarkdownIt('zero');

  if (opts.enableLineBreaks) {
    markdownIt.use(lineBreak);
  }

  if (opts.enablePageBreak) {
    markdownIt.use(pageBreak);
  }

  return markdownIt;
};
