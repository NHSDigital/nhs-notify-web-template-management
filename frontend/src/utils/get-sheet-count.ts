export const getSheetCount = (pageCount: number, bothSidesFlag: boolean) =>
  Math.ceil(pageCount / (bothSidesFlag ? 2 : 1));
