export const sortAscByCreatedAt = <T>(
  items: T & { createdAt: string; id: string }[]
) =>
  items.sort((a, b) => {
    const aCreatedAt = a.createdAt;
    const bCreatedAt = b.createdAt;

    if (aCreatedAt === bCreatedAt) {
      return a.id.localeCompare(b.id);
    }
    return aCreatedAt < bCreatedAt ? 1 : -1;
  });
