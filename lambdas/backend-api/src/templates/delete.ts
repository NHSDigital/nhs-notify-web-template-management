import { createHandler } from './api/delete';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
