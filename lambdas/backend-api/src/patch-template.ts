import { createHandler } from './api/patch-template';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
