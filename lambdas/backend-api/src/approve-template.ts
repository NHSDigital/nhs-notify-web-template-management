import { createHandler } from './api/approve-template';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
