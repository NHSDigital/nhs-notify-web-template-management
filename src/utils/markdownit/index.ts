import MarkdownIt from 'markdown-it';
import { lineBreak, pageBreak } from './plugins';

export class MarkdownItWrapper extends MarkdownIt {
  constructor() {
    super('zero');
  }

  /**
   * Enables the line break feature for the MarkdownItWrapper instance.
   *
   * @return {this} Returns the instance of the MarkdownItWrapper class for method chaining.
   */
  enableLineBreak() {
    this.use(lineBreak);
    return this;
  }

  /**
   * Enables the page break feature and enables the 'hr' rule.
   *
   * @return {this} Returns the instance of the MarkdownItWrapper class for method chaining.
   */
  enablePageBreak() {
    this.use(pageBreak);
    this.enable('hr');
    return this;
  }
}
