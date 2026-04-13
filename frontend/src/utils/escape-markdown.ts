/**
 * Escape markdown special characters: \ ` * _ [ ] ( ) #  - . ! |
 */
export const escapeMarkdown = (text: string): string => {
  return text.replaceAll(/([!#()*.[\\\]_`|-])/g, String.raw`\$1`);
};
