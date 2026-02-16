import z from 'zod/v4';
import type { RenderRequest } from '../types/render-request';
import { schemaFor } from './schema-for';

const $Common = z.object({
  template: z.object({
    templateId: z.string(),
    clientId: z.string(),
  }),
});

const $InitialRenderRequest = $Common.extend({
  requestType: z.literal('initial'),
});

const $PersonalisedRenderRequest = $Common.extend({
  requestType: z.literal('personalised'),
});

export const $RenderRequest = schemaFor<RenderRequest>()(
  z.discriminatedUnion('requestType', [
    $InitialRenderRequest,
    $PersonalisedRenderRequest,
  ])
);
