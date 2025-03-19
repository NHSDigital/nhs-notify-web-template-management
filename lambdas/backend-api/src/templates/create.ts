import { createHandler } from './api/create';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
