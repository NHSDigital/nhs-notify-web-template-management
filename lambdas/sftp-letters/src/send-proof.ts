import { createHandler } from './apis/send-handler';
import { createContainer } from './container-send';

export const handler = createHandler(createContainer());
