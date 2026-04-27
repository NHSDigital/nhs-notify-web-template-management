import { createHandler } from '@backend-api/api/create-contact-details';
import { contactDetailsContainer } from '@backend-api/container/contact-details';

export const handler = createHandler(contactDetailsContainer());
