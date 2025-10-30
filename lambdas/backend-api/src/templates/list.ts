import { createHandler } from './api/list';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
