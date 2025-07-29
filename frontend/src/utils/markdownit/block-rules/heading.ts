// Patched version of https://github.com/markdown-it/markdown-it/blob/13.0.2/lib/rules_block/heading.js
// Modified to remove requirement for spaces after hashes
// This to emulate GUKN behaviour on emails

// Disable lint rule in patched file as I want to stick to the original source code as much as possible
/* eslint-disable unicorn/prefer-code-point */

import { isSpace } from 'markdown-it/lib/common/utils';
import type StateBlock from 'markdown-it/lib/rules_block/state_block';

export function headingNoSpaces(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }

  let ch = state.src.charCodeAt(pos);

  if (ch !== 0x23 /* # */ || pos >= max) {
    return false;
  }

  // count heading level
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23 /* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  // Modified to remove requirement to have a space after the hash
  // Original code:
  // if (level > 6 || (pos < max && !isSpace(ch))) {
  if (level > 6) {
    return false;
  }

  /* istanbul ignore next */
  if (silent) {
    return true;
  }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }

  state.line = startLine + 1;

  let token = state.push('heading_open', 'h' + String(level), 1);
  token.markup = '########'.slice(0, level);
  token.map = [startLine, state.line];

  token = state.push('inline', '', 0);
  token.content = state.src.slice(pos, max).trim();
  token.map = [startLine, state.line];
  token.children = [];

  token = state.push('heading_close', 'h' + String(level), -1);
  token.markup = '########'.slice(0, level);

  return true;
}
