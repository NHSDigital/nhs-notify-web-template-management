import type { Options, Token } from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer';

export const headingMaxDepth =
  (maxDepth: number) =>
  (
    tokens: Token[],
    idx: number,
    options: Options,
    env: unknown,
    self: Renderer
  ) => {
    const token = tokens[idx];

    if (Number(token.tag.slice(1)) > Math.min(Math.floor(maxDepth), 6)) {
      token.tag = 'p';
    }

    return self.renderToken(tokens, idx, options);
  };
