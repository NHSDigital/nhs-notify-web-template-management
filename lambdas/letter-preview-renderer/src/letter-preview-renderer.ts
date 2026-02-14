import { createHandler } from './api/sqs-handler';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
