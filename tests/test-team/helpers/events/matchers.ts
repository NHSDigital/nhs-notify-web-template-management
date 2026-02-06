import z from 'zod';

const $PartialCloudEvent = z.object({ type: z.string() });

export const eventWithId = (id: string) =>
  $PartialCloudEvent.extend(
    z.object({ data: z.object({ id: z.literal(id) }) })
  );

export const eventWithIdIn = (ids: [string, ...string[]]) =>
  $PartialCloudEvent.extend(z.object({ data: z.object({ id: z.enum(ids) }) }));
