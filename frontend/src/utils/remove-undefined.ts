export const removeUndefinedFromObject = <T>(obj: Record<string, unknown>): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, val]) => val !== undefined)
  ) as T;
