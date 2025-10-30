import { createHandler } from './api/update';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
