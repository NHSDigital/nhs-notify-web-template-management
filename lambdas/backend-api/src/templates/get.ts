import { createHandler } from './api/get';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
