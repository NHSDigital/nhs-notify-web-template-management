import { createHandler } from './api/set-letter-file-virus-scan-status';
import { createContainer } from './container';

export const handler = createHandler(createContainer());
