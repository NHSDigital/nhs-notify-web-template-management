import { createHandler } from './api/get';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
