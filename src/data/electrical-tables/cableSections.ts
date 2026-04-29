export const commonCableSectionsMm2 = [
  1.5,
  2.5,
  4,
  6,
  10,
  16,
  25,
  35,
  50,
  70,
  95,
] as const;

export function suggestMinimumCableSectionByCurrent(currentAmps: number): number | null {
  const simplifiedTable = [
    { maxCurrent: 15.5, section: 1.5 },
    { maxCurrent: 21, section: 2.5 },
    { maxCurrent: 28, section: 4 },
    { maxCurrent: 36, section: 6 },
    { maxCurrent: 50, section: 10 },
    { maxCurrent: 68, section: 16 },
    { maxCurrent: 89, section: 25 },
    { maxCurrent: 111, section: 35 },
    { maxCurrent: 134, section: 50 },
  ];

  return simplifiedTable.find((item) => currentAmps <= item.maxCurrent)?.section ?? null;
}
