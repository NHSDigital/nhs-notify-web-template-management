import MarkdownIt from 'markdown-it';
import { renderToString } from 'react-dom/server';
import { PageBreak } from '@atoms/PageBreak/PageBreak';

export function pageBreak(md: MarkdownIt) {
  md.renderer.rules.hr = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    if (token.markup === '***') {
      return renderToString(PageBreak());
    }
    // Render the default hr if the value is not ***
    return self.renderToken(tokens, idx, options);
  };
}
