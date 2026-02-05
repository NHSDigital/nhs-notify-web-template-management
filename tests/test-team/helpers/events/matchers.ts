import z from 'zod';

export const eventWithId = (id: string) =>
  z.object({ data: z.object({ id: z.literal(id) }) });

export const eventWithIdIn = (ids: [string, ...string[]]) =>
  z.object({ data: z.object({ id: z.enum(ids) }) });
