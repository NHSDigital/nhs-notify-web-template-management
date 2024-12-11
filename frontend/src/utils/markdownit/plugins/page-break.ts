'use client';

import MarkdownIt from 'markdown-it';
import { renderToString } from 'react-dom/server';
import { PageBreak } from '@atoms/PageBreak/PageBreak';

export function pageBreak(md: MarkdownIt) {
  const defaultRender = md.renderer.rules.text!;

  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const { content } = token;

    // Replace *** with a Page break
    const pageBreakHtml = renderToString(PageBreak());
    const newContent = content.replaceAll('***', pageBreakHtml);

    return defaultRender(tokens, idx, options, env, self).replace(
      content,
      newContent
    );
  };
}
