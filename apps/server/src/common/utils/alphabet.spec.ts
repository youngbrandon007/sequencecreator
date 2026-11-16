import { isValidJoinCode, normalizeJoinCode } from './alphabet';

describe('join code alphabet', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeJoinCode(' ab12cd ')).toBe('AB12CD');
  });

  it('rejects ambiguous characters', () => {
    expect(isValidJoinCode('ABCDEF', 6)).toBe(true);
    expect(isValidJoinCode('ABCDE0', 6)).toBe(false);
    expect(isValidJoinCode('ABCDEO', 6)).toBe(false);
    expect(isValidJoinCode('ABCDE1', 6)).toBe(false);
    expect(isValidJoinCode('ABCDEI', 6)).toBe(false);
    expect(isValidJoinCode('ABC', 6)).toBe(false);
  });
});
