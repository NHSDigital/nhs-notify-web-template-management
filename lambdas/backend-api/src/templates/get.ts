import { createHandler } from './api/get';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
