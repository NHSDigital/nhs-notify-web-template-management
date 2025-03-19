import { createHandler } from './api/create-letter';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
