import path from 'node:path';

export const SOURCE_DOCS = Object.fromEntries(
  [
    'marker-types.docx',
    'not-a-template.txt',
    'rtl.docx',
    'standard-english.docx',
  ].map((filename) => [
    filename,
    {
      name: filename,
      path: path.join(__dirname, filename),
    },
  ])
);
