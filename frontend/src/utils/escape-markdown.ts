export const escapeMarkdown = (text: string): string => {
  // Escape markdown special characters: \ ` * _ { } [ ] ( ) # + - . ! |
  return text.replaceAll(/([!#()*+.[\\\]_`{|}-])/g, String.raw`\$1`);
};
