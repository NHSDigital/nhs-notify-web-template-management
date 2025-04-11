import { z } from 'zod';
import { parse } from 'csv-parse/sync';

export function parseTestPersonalisation(csv: string) {
  const [, ...rows] = parse(csv);

  const input = z
    .array(z.tuple([z.string(), z.string(), z.string(), z.string()]))
    .min(1)
    .parse(rows);

  return Array.from({ length: 3 }, (_, colIdx) =>
    Object.fromEntries(
      input.map(([field], rowIdx) => [field, input[rowIdx][colIdx + 1]])
    )
  );
}
