export const stringToYenLayout = (flatLayout: string, size: number): string => {
  let yenLayout = "";
  let currentIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= r; c++) {
      yenLayout += flatLayout[currentIndex];
      currentIndex++;
    }
    if (r < size - 1) yenLayout += "/";
  }
  return yenLayout;
};

export const coordsToIndex = (x: number, y: number, size: number): number => {
  const row = size - 1 - x;
  return (row * (row + 1)) / 2 + y;
};

export const getInitialLayout = (n: number): string => {
  return ".".repeat((n * (n + 1)) / 2);
};