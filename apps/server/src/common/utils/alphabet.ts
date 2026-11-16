/** Ambiguous characters (0/O, 1/I) omitted for easier verbal sharing. */
export const JOIN_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function normalizeJoinCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidJoinCode(code: string, length: number): boolean {
  if (code.length !== length) {
    return false;
  }
  for (const char of code) {
    if (!JOIN_CODE_ALPHABET.includes(char)) {
      return false;
    }
  }
  return true;
}
