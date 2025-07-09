import MarkdownIt from 'markdown-it';
import { lineBreak } from './plugins/line-break';

export class MarkdownItWrapper extends MarkdownIt {
  constructor() {
    super('zero');

    // rendered links should open in a new tab
    this.renderer.rules.link_open = (tokens, idx) => {
      const href = tokens[idx].attrGet('href');

      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
    };
  }

  /**
   * Enables the line break feature
   *
   * @return {this} Returns the instance of the MarkdownItWrapper class for method chaining.
   */
  enableLineBreak() {
    this.use(lineBreak);
    return this;
  }
}

export function renderSMSMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  return markdown.render(value);
}

export function renderNHSAppMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable(['heading', 'link', 'list', 'emphasis']);

  return markdown.render(value);
}

export function renderEmailMarkdown(
  value: string,
  markdown = new MarkdownItWrapper()
) {
  markdown
    .enableLineBreak()
    .enable(['heading', 'link', 'list', 'emphasis', 'hr']);

  return markdown.render(value);
}

export function withEmbeddedLink(
  content: string,
  markdown = new MarkdownItWrapper()
) {
  markdown.enableLineBreak().enable('link');
  return markdown.renderInline(content);
}
