import { createHandler } from './api/update';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
