import MarkdownIt from 'markdown-it';
import { headingNoSpaces } from './block-rules/heading';
import { hrUnderscoreOnly } from './block-rules/hr';
import { headingMaxDepth } from './render-rules/heading';
import { linkOpenNewTab } from './render-rules/link-open';

/**
 * Renders markdown matching GovUK Notify email formatting as closely as possible
 */
export function renderEmailMarkdown(value: string) {
  const markdown = new MarkdownIt('zero'); // Start with no presets. Most rules are disabled - https://github.com/markdown-it/markdown-it/blob/13.0.2/lib/presets/zero.js

  // Enable rules that just work out of the box
  markdown.enable(['list', 'hr']);

  // Configure Links
  markdown.enable(['link']); // Enable basic markdown links with [Text](https://example.com) syntax

  markdown.set({ linkify: true }); // Add linkify instance
  markdown.core.ruler.enable(['linkify']); // Enable linkify rules

  markdown.linkify.set({ fuzzyIP: false, fuzzyEmail: false, fuzzyLink: false }); // Don't do fuzzy matching - only linkify things beginning with http / https protocol

  markdown.renderer.rules.link_open = linkOpenNewTab; // Open links in a new tab

  // Strip out images
  markdown.enable(['image']);
  markdown.renderer.rules.image = () => '';

  // Configure line breaks
  markdown.set({ breaks: true }); // Convert \n to <br>
  markdown.inline.ruler.enable(['newline']); // Support double-space line endings to <br>

  // Configure headings
  markdown.enable(['heading']); // Enable heading support

  markdown.block.ruler.at('heading', headingNoSpaces); // Support headings with no spaces after the hash (#Heading)

  markdown.renderer.rules.heading_open = headingMaxDepth; // Only support headings up to <h2> - otherwise render <p>

  return markdown.render(value);
}

export function renderNHSAppMarkdown(value: string) {
  const markdown = new MarkdownIt('zero'); // Start with no presets. Most rules are disabled - https://github.com/markdown-it/markdown-it/blob/13.0.2/lib/presets/zero.js

  markdown.enable(['heading', 'emphasis', 'list', 'image', 'link', 'hr']); // Enable out of the box rules

  markdown.inline.ruler.enable(['newline']); // Enable newline support with double-space line endings

  markdown.block.ruler.at('hr', hrUnderscoreOnly); // Only support <hr> via underscores (not * or -)

  return markdown.render(value);
}

export function renderSMSMarkdown(value: string) {
  const markdown = new MarkdownIt('zero'); // Start with no presets. Most rules are disabled - https://github.com/markdown-it/markdown-it/blob/13.0.2/lib/presets/zero.js

  markdown.set({ linkify: true }); // Add linkify instance
  markdown.core.ruler.enable(['linkify']); // Enable linkify rules
  markdown.linkify.set({ fuzzyIP: false, fuzzyEmail: false, fuzzyLink: true }); // Support fuzzy matching for links

  return markdown.render(value);
}
