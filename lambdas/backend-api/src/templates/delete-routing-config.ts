import { createHandler } from './api/delete-routing-config';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
