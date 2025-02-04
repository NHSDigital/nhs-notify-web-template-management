import MarkdownIt from 'markdown-it';
import { lineBreak } from './plugins/line-break';

export class MarkdownItWrapper extends MarkdownIt {
  constructor() {
    super('zero');
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
