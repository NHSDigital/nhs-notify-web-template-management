import { createContainer } from './create-letter/container';
import { createHandler } from './create-letter/handler';

export const handler = createHandler(createContainer());
