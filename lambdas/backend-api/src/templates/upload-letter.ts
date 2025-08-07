import { createHandler } from './api/upload-letter';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
