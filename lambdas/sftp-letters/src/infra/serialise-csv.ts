import { stringify } from 'csv-stringify';

export async function serialiseCsv(
  objects: Record<string, string | undefined>[],
  header: string
): Promise<string> {
  const stringifier = stringify(objects, {
    cast: {
      string(value) {
        return value.replaceAll('\n', ' ').trim();
      },
    },
    columns: header.split(','),
    quoted: true,
    eof: false,
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of stringifier) {
    chunks.push(Buffer.from(chunk));
  }

  // header is not quoted
  return `${header}\n${Buffer.concat(chunks).toString('utf8')}`;
}
