import { createHandler } from './api/submit';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
