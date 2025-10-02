import { createHandler } from './api/list-routing-configs';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
