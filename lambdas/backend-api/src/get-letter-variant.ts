import { createHandler } from './api/get-letter-variant';
import { letterVariantContainer } from './container/letter-variant';

export const handler = createHandler(letterVariantContainer());
