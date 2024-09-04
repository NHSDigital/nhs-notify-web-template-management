import { a } from '@aws-amplify/backend';

const CHANNEL_TYPES = ['SMS', 'EMAIL', 'LETTER', 'NHS_APP'] as const;

export type TemplateStorage<TFields extends Record<string, unknown>> = {
  id: string;
  name: string;
  type?: (typeof CHANNEL_TYPES)[number] | null;
  version: number;
  fields?: TFields | null;
  createdAt: string;
  updatedAt: string;
} | null;

// TODO: How can I get this converted into a TS type?
export const TemplateStorageModel = {
  id: a.string().required(),
  name: a.string().required(),
  type: a.enum(CHANNEL_TYPES),
  version: a.integer().required(),
  fields: a.customType({
    body: a.string().required(),
  }),
};
