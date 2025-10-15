export const sortAscByUpdatedAt = <T>(
  items: T & { updatedAt: string; id: string }[]
) =>
  items.sort((a, b) => {
    const aUpdatedAt = a.updatedAt;
    const bUpdatedAt = b.updatedAt;

    if (aUpdatedAt === bUpdatedAt) {
      return a.id.localeCompare(b.id);
    }
    return aUpdatedAt < bUpdatedAt ? 1 : -1;
  });
