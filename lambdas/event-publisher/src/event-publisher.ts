import { createContainer } from './container';
import { createHandler } from './apis/sqs-handler';

export const handler = createHandler(createContainer());
