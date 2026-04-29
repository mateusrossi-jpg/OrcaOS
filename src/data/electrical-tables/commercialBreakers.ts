export const commercialBreakersAmps = [
  6,
  10,
  16,
  20,
  25,
  32,
  40,
  50,
  63,
  70,
  80,
  100,
  125,
] as const;

export function suggestNextBreaker(currentAmps: number): number | null {
  return commercialBreakersAmps.find((breaker) => breaker >= currentAmps) ?? null;
}
