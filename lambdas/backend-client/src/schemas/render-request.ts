import z from 'zod/v4';
import type { RenderRequest } from '../types/render-request';
import { schemaFor } from './schema-for';

const $Common = z.object({
  templateId: z.string(),
  clientId: z.string(),
  currentVersion: z.string(),
});

const $InitialRenderRequest = z.object({
  ...$Common.shape,
  requestType: z.literal('initial'),
});

const $PersonalisedCommon = z.object({
  ...$Common.shape,
  requestType: z.literal('personalised'),
  personalisation: z.record(z.string(), z.string()),
  lockNumber: z.number(),
});

const $ShortPersonalisedRenderRequest = z.object({
  ...$PersonalisedCommon.shape,
  requestTypeVariant: z.literal('short'),
});

const $LongPersonalisedRenderRequest = z.object({
  ...$PersonalisedCommon.shape,
  requestTypeVariant: z.literal('long'),
});

const $PersonalisedRenderRequest = z.discriminatedUnion('requestTypeVariant', [
  $ShortPersonalisedRenderRequest,
  $LongPersonalisedRenderRequest,
]);

export const $RenderRequest = schemaFor<RenderRequest>()(
  z.discriminatedUnion('requestType', [
    $InitialRenderRequest,
    $PersonalisedRenderRequest,
  ])
);
