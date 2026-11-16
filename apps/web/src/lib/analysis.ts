export type ShowAct = {
  id: string
  title: string
  event: string
  people: string[]
}

export type DistanceHit = {
  index: number
  nextIndex: number
  /** Number of entries between the two appearances (nextIndex - index - 1). */
  entriesBetween: number
  /** Index delta used by the original app (nextIndex - index). */
  distanceToNext: number
}

export type DistanceMap = Record<string, DistanceHit[]>

export function analyzeShow(acts: ShowAct[]): {
  byPerson: DistanceMap
  byEvent: DistanceMap
} {
  const byPerson: DistanceMap = {}
  const byEvent: DistanceMap = {}

  const personIndexes = new Map<string, number[]>()
  const eventIndexes = new Map<string, number[]>()

  acts.forEach((act, index) => {
    const event = act.event.trim() || '(no event)'
    if (!eventIndexes.has(event)) eventIndexes.set(event, [])
    eventIndexes.get(event)!.push(index)

    for (const person of act.people) {
      const key = person.trim()
      if (!key) continue
      if (!personIndexes.has(key)) personIndexes.set(key, [])
      personIndexes.get(key)!.push(index)
    }
  })

  for (const [name, indexes] of personIndexes) {
    byPerson[name] = pairsFromIndexes(indexes)
  }
  for (const [name, indexes] of eventIndexes) {
    byEvent[name] = pairsFromIndexes(indexes)
  }

  return { byPerson, byEvent }
}

function pairsFromIndexes(indexes: number[]): DistanceHit[] {
  const hits: DistanceHit[] = []
  for (let i = 0; i < indexes.length - 1; i++) {
    const index = indexes[i]!
    const nextIndex = indexes[i + 1]!
    hits.push({
      index,
      nextIndex,
      distanceToNext: nextIndex - index,
      entriesBetween: nextIndex - index - 1,
    })
  }
  return hits
}

export function filterClose(
  map: DistanceMap,
  maxEntriesBetween: number,
): DistanceMap {
  const out: DistanceMap = {}
  for (const [key, hits] of Object.entries(map)) {
    const filtered = hits.filter((h) => h.entriesBetween <= maxEntriesBetween)
    if (filtered.length) out[key] = filtered
  }
  return out
}
