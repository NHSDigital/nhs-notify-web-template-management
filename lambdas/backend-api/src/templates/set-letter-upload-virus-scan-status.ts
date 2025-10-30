import { createHandler } from './api/set-letter-upload-virus-scan-status';
import { templateRepositoryContainer } from './container';

export const handler = createHandler(templateRepositoryContainer());
