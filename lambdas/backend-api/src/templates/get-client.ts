import { createHandler } from './api/get-client-configuration';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
