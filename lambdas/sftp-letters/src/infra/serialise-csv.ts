import { stringify } from 'csv-stringify';

export const serialiseCsv = (
  objects: { [x: string]: string | undefined }[],
  header: string
): Promise<string> => {
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
  return new Promise((resolve, reject) => {
    stringifier.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stringifier.on('error', (err) => reject(err));
    stringifier.on('end', () =>
      // headers are not quoted
      resolve(`${header}\n${Buffer.concat(chunks).toString('utf8')}`)
    );
  });
};
