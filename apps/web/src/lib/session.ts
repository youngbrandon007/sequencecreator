import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { randomId } from './ids'

export type SessionInfo = {
  code: string
  title: string | null
  createdAt: string
  lastActiveAt: string
}

export type EntrySnapshot = {
  id: string
  name: string
  event: string
  people: string[]
  percentage: string
}

export type ShowSlotSnapshot = {
  id: string
  entryId: string
}

const SCHEMA_VERSION = 2

export function apiBase(): string {
  return ''
}

export function wsBase(): string {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${location.host}/yjs`
}

export async function createSession(title?: string): Promise<SessionInfo> {
  const res = await fetch(`${apiBase()}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(title ? { title } : {}),
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export async function fetchSession(code: string): Promise<SessionInfo> {
  const res = await fetch(`${apiBase()}/api/sessions/${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error('Session not found')
  return res.json()
}

export type LiveSession = {
  doc: Y.Doc
  provider: WebsocketProvider
  entries: Y.Array<Y.Map<unknown>>
  show: Y.Array<Y.Map<unknown>>
  meta: Y.Map<unknown>
  destroy: () => void
}

export function connectLiveSession(code: string): LiveSession {
  const doc = new Y.Doc()
  const meta = doc.getMap('meta')
  const entries = doc.getArray<Y.Map<unknown>>('entries')
  const show = doc.getArray<Y.Map<unknown>>('show')
  const provider = new WebsocketProvider(wsBase(), code, doc)

  doc.transact(() => {
    if (!meta.has('schemaVersion')) {
      meta.set('schemaVersion', SCHEMA_VERSION)
    }
  })

  return {
    doc,
    provider,
    entries,
    show,
    meta,
    destroy: () => {
      provider.destroy()
      doc.destroy()
    },
  }
}

export function readEntry(map: Y.Map<unknown>): EntrySnapshot {
  const peopleArr = map.get('people')
  let people: string[] = []
  if (peopleArr instanceof Y.Array) {
    people = peopleArr.toArray().map(String)
  } else if (typeof peopleArr === 'string') {
    people = peopleArr
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean)
  }
  return {
    id: String(map.get('id') ?? ''),
    name: String(map.get('name') ?? ''),
    event: String(map.get('event') ?? ''),
    people,
    percentage: String(map.get('percentage') ?? ''),
  }
}

export function readShowSlot(map: Y.Map<unknown>): ShowSlotSnapshot {
  return {
    id: String(map.get('id') ?? ''),
    entryId: String(map.get('entryId') ?? ''),
  }
}

export function createEntryMap(
  partial?: Partial<EntrySnapshot>,
): Y.Map<unknown> {
  const map = new Y.Map<unknown>()
  map.set('id', partial?.id ?? randomId())
  map.set('name', partial?.name ?? '')
  map.set('event', partial?.event ?? '')
  map.set('percentage', partial?.percentage ?? '')
  const people = new Y.Array<string>()
  people.push(partial?.people ?? [])
  map.set('people', people)
  return map
}

export function setEntryPeople(map: Y.Map<unknown>, people: string[]): void {
  let arr = map.get('people')
  if (!(arr instanceof Y.Array)) {
    arr = new Y.Array<string>()
    map.set('people', arr)
  }
  const yarr = arr as Y.Array<string>
  yarr.delete(0, yarr.length)
  if (people.length) yarr.push(people)
}

export function entryTitle(entry: EntrySnapshot): string {
  if (entry.name.trim()) return entry.name.trim()
  const people = entry.people.join(', ')
  const event = entry.event.trim() || 'act'
  return people ? `${event} — ${people}` : event
}

export function rosterFromEntries(entries: EntrySnapshot[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const e of entries) {
    for (const p of e.people) {
      const key = p.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(p)
    }
  }
  return out.sort((a, b) => a.localeCompare(b))
}
