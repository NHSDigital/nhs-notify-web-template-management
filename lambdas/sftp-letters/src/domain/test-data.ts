import { z } from 'zod';

export type TestCustomPersonalisation = [
  Record<string, string>,
  Record<string, string>,
  Record<string, string>,
];

type Input = Array<{
  parameter: string;
  'short example': string;
  'medium example': string;
  'long example': string;
}>;

const $Cell = z.union([z.string(), z.number()]).transform(String);

const pivotCol = (input: Input, col: keyof Input[number]) =>
  Object.fromEntries(input.map((row) => [row.parameter, row[col]]));

const pivot = (input: Input): TestCustomPersonalisation => [
  pivotCol(input, 'short example'),
  pivotCol(input, 'medium example'),
  pivotCol(input, 'long example'),
];

export function parseTestPersonalisation(rawJson: unknown) {
  const input = z
    .array(
      z.object({
        parameter: z.string(),
        'short example': $Cell,
        'medium example': $Cell,
        'long example': $Cell,
      })
    )
    .min(1)
    .parse(rawJson);

  return pivot(input);
}
