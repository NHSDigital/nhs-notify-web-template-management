import { createHandler } from './api/create';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
