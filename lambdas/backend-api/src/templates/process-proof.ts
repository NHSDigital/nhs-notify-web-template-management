import { createHandler } from './api/process-proof';
import { letterFileRepositoryAndTemplateRepositoryContainer } from './container';

export const handler = createHandler(
  letterFileRepositoryAndTemplateRepositoryContainer()
);
