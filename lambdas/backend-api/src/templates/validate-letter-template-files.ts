import { createHandler } from './api/validate-letter-template-files';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
