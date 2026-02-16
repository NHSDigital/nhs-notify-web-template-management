export type Success<T> = { ok: true; data: T };

export type Failure<T> = { ok: false; error: T };

export type Result<T, E = unknown> = Success<T> | Failure<E>;

export const success = <T>(data: T): Success<T> => ({ ok: true, data });

export const failure = <E>(error: E): Failure<E> => ({ ok: false, error });
