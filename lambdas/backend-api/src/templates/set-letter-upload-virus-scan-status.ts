import { createHandler } from './api/set-letter-upload-virus-scan-status';
import { templateRepositoryContainer } from './container/templates-repository';

export const handler = createHandler(templateRepositoryContainer());
