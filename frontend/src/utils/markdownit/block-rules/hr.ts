// Patched version of https://github.com/markdown-it/markdown-it/blob/13.0.2/lib/rules_block/hr.js
// Modified to remove support for *** and ---

// Disable lint rule in patched file as I want to stick to the original source code as much as possible
/* eslint-disable unicorn/prefer-code-point, unicorn/number-literal-case, unicorn/new-for-builtins */

import { isSpace } from 'markdown-it/lib/common/utils';
import type StateBlock from 'markdown-it/lib/rules_block/state_block';

// Horizontal rule

export function hrUnderscoreOnly(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }

  const marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (
    // PATCH: remove support for * and -
    // marker !== 0x2a /* * */ &&
    // marker !== 0x2d /* - */ &&
    marker !== 0x5f /* _ */
  ) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 of them

  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) {
      return false;
    }
    if (ch === marker) {
      cnt++;
    }
  }

  if (cnt < 3) {
    return false;
  }

  if (silent) {
    return true;
  }

  state.line = startLine + 1;

  const token = state.push('hr', 'hr', 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

  return true;
}
