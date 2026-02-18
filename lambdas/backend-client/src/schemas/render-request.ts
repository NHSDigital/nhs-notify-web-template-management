import z from 'zod/v4';
import type { RenderRequest } from '../types/render-request';
import { schemaFor } from './schema-for';

const $Common = z.object({
  templateId: z.string(),
  clientId: z.string(),
  currentVersion: z.string(),
});

const $InitialRenderRequest = $Common.extend({
  requestType: z.literal('initial'),
});

const $ShortPersonalisedRenderRequest = $Common.extend({
  requestType: z.literal('personalised-short'),
});

const $LongPersonalisedRenderRequest = $Common.extend({
  requestType: z.literal('personalised-long'),
});

export const $RenderRequest = schemaFor<RenderRequest>()(
  z.discriminatedUnion('requestType', [
    $InitialRenderRequest,
    $ShortPersonalisedRenderRequest,
    $LongPersonalisedRenderRequest,
  ])
);
