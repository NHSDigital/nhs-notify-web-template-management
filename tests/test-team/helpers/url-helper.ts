export const getIdFromUrl = (fullUrl: string, pageSegment: string) => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const match = fullUrl.match(new RegExp(`${pageSegment}\\/([^#/?]+)`));
  const id = match ? match[1] : undefined;
  return id;
};
