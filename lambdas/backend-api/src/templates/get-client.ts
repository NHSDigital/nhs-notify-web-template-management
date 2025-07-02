import { createHandler } from './api/get-client';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
