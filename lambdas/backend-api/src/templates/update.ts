import { createHandler } from './api/update';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
