import { z } from 'zod';
import { parse } from 'csv-parse/sync';
import { staticPdsExampleData } from './synthetic-batch-data';

export function parseExamplePersonalisation(csv: string) {
  const [, ...rows] = parse(csv);

  const input = z
    .array(z.tuple([z.string(), z.string(), z.string(), z.string()]))
    .min(1)
    .parse(rows);

  return Array.from({ length: staticPdsExampleData.length }, (_, colIdx) =>
    Object.fromEntries(
      input.map(([field], rowIdx) => [field, input[rowIdx][colIdx + 1]])
    )
  );
}
