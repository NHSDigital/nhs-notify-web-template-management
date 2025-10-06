import { createHandler } from './api/count-routing-configs';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
