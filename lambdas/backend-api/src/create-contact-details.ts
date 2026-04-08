import { createHandler } from '@backend-api/api/contact-details-request-verification';
import { contactDetailsContainer } from '@backend-api/container/contact-details';

export const handler = createHandler(contactDetailsContainer());
