import { createHandler } from './api/delete';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
