import type { Container } from '../container-poll';

type EventBridgeEvent = {
    supplier: string;
};

export const createHandler =
  ({ app }: Container) =>
  ({ supplier }: EventBridgeEvent) =>
    app.poll(supplier);
