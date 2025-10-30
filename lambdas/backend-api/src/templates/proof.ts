import { createHandler } from './api/proof';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
