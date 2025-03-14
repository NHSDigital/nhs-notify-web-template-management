import { createHandler } from './api/list';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
