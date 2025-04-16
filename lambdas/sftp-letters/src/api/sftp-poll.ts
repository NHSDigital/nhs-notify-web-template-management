import type { Container } from '../container-poll';

type EventBridgeEvent = {
  event: {
    supplier: string;
  };
};

export const createHandler =
  ({ app }: Container) =>
  ({ event: { supplier } }: EventBridgeEvent) =>
    app.poll(supplier);
