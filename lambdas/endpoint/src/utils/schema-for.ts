import { z } from 'zod';

export const schemaFor =
  <Output, Input = Output>() =>
  <S extends z.ZodType<Output, z.ZodTypeDef, Input>>(schema: S) =>
    schema;
