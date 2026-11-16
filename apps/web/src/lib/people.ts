const SPLIT_RE = /[,;\n]+/

/** Split a free-text people field into trimmed tokens (order preserved, de-duped). */
export function splitPeople(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(SPLIT_RE)) {
    const name = part.trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

export function joinPeople(people: string[]): string {
  return people.join(', ')
}

/** Bounds of the person token under the caret (excluding leading spaces in the token). */
export function tokenBounds(
  value: string,
  caret: number,
): { token: string; start: number; end: number } {
  let start = Math.max(0, Math.min(caret, value.length))
  while (start > 0 && !/[,;\n]/.test(value[start - 1]!)) start -= 1
  let end = Math.max(0, Math.min(caret, value.length))
  while (end < value.length && !/[,;\n]/.test(value[end]!)) end += 1
  const raw = value.slice(start, end)
  const lead = raw.match(/^\s*/)?.[0].length ?? 0
  const token = raw.trim()
  return {
    token,
    start: start + lead,
    end: start + lead + token.length,
  }
}

export function autocompleteCandidates(
  token: string,
  roster: string[],
): string[] {
  const q = token.trim().toLowerCase()
  if (!q) return []
  const matches = roster
    .filter(
      (name) =>
        name.toLowerCase().startsWith(q) && name.toLowerCase() !== q,
    )
    .sort((a, b) => a.length - b.length || a.localeCompare(b))

  const seen = new Set<string>()
  const out: string[] = []
  for (const m of matches) {
    const k = m.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(m)
  }
  return out
}

export function applyAutocomplete(
  value: string,
  caret: number,
  completion: string,
  options?: { trailingSeparator?: boolean },
): { value: string; caret: number } {
  const { start, end } = tokenBounds(value, caret)
  const trailing =
    options?.trailingSeparator && end >= value.trimEnd().length ? ', ' : ''
  const inserted = completion + trailing
  const next = value.slice(0, start) + inserted + value.slice(end)
  return { value: next, caret: start + inserted.length }
}
