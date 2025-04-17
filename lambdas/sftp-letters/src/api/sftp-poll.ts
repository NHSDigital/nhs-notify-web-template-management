import type { Container } from '../container-poll';

type PollEvent = {
  supplier: string;
};

export const createHandler =
  ({ app }: Container) =>
  ({ supplier }: PollEvent) =>
    app.poll(supplier);
