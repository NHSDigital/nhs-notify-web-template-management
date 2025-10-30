import { createHandler } from './api/get-client-configuration';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
