import { createHandler } from './api/create-routing-config';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
