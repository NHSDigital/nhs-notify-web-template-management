import { createHandler } from './api/set-letter-upload-virus-scan-status';
import { createTemplateRepositoryContainer } from './container';

export const handler = createHandler(createTemplateRepositoryContainer());
