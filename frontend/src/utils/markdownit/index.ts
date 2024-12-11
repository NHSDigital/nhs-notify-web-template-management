import MarkdownIt from 'markdown-it';
import { lineBreak } from './plugins/line-break';
import { pageBreak } from './plugins/page-break';

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

  /**
   * Enables the page break feature
   *
   * @return {this} Returns the instance of the MarkdownItWrapper class for method chaining.
   */
  enablePageBreak() {
    this.use(pageBreak);
    return this;
  }
}
