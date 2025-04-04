import { createHandler } from './apis/send-handler';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
