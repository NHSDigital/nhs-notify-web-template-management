import { createHandler } from './api/get-client-configuration';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
