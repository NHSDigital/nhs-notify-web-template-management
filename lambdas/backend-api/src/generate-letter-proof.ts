import { createHandler } from './api/generate-letter-proof';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
