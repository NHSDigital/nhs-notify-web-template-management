import { createHandler } from './api/list';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
