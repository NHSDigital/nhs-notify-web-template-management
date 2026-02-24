import { createHandler } from './api/get-template-letter-variants';
import { templatesContainer } from './container/templates';

export const handler = createHandler(templatesContainer());
