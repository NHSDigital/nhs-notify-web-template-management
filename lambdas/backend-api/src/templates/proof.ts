import { createHandler } from './api/proof';
import { templatesContainer } from './container';

export const handler = createHandler(templatesContainer());
