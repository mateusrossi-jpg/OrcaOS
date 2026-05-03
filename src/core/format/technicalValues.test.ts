import { describe, expect, it } from 'vitest';
import { formatKilowattsFromWatts } from './technicalValues';

describe('technical value formatting', () => {
  it('does not round small watt values to zero kilowatts', () => {
    expect(formatKilowattsFromWatts(2.2)).toBe('0,0022 kW');
  });

  it('keeps common kilowatt values concise', () => {
    expect(formatKilowattsFromWatts(2200)).toBe('2,2 kW');
  });
});

