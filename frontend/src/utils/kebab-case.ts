/* eslint-disable unicorn/prefer-string-replace-all */

export const toKebabCase = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^\da-z]+/g, '-')
    // eslint-disable-next-line sonarjs/slow-regex
    .replace(/(?:^-+)|(?:-+$)/g, '')
    .replace(/-+/g, '-');
