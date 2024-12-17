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
