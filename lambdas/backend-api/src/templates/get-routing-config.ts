import { createHandler } from './api/get-routing-config';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
