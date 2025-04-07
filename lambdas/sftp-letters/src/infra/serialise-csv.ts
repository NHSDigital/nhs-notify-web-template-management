import { stringify } from 'csv-stringify';

export const serialise = (
  objects: { [x: string]: string | undefined }[],
  header: string
): Promise<string> => {
  const stringifier = stringify(objects, {
    // remove any newlines and trim
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
    // add header on end
    stringifier.on('end', () =>
      resolve(`${header}\n${Buffer.concat(chunks).toString('utf8')}`)
    );
  });
};
