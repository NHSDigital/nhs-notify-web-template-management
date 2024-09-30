export const calculateHowManySmsMessages = (val: number) => {
  if (typeof val !== 'number' || Number.isNaN(val)) return 0;

  if (val > 0 && val <= 160) return 1;

  return Math.ceil(val / 153);
};
