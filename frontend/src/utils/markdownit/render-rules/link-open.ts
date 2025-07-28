import type { Options, Token } from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer';

export function linkOpenNewTab(
  tokens: Token[],
  idx: number,
  options: Options,
  env: unknown,
  self: Renderer
) {
  const token = tokens[idx];

  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener noreferrer');

  return self.renderToken(tokens, idx, options);
}
