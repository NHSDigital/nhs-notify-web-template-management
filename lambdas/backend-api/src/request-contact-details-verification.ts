import { createHandler } from '@backend-api/api/request-contact-details-verification';
import { contactDetailsContainer } from '@backend-api/container/contact-details';

export const handler = createHandler(contactDetailsContainer());
