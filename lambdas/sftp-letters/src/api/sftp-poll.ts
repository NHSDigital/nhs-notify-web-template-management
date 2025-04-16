import type { Container } from '../container-poll';

export const createHandler =
  ({ app }: Container) =>
  () =>
    app.poll();
