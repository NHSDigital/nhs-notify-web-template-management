import { z } from 'zod/v4';

export const schemaFor =
  <Output, Input = Output>() =>
  <S extends z.ZodType<Output, Input>>(schema: S) =>
    schema;
