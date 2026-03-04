import { createHandler } from './api/letter-proof';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
