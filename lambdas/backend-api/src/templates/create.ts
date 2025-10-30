import { createHandler } from './api/create';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
