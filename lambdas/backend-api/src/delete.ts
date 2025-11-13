import { createHandler } from './api/delete';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
