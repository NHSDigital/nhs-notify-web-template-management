import z from 'zod';

const $PartialCloudEvent = z.object({ type: z.string() });

export const eventWithId = (id: string) =>
  $PartialCloudEvent.extend({ data: z.object({ id: z.literal(id) }).loose() });

export const eventWithIdIn = (ids: [string, ...string[]]) =>
  $PartialCloudEvent.extend({ data: z.object({ id: z.enum(ids) }).loose() });
