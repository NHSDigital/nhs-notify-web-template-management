import { createHandler } from './api/update-routing-config';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
