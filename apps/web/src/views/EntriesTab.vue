<script setup lang="ts">
import * as Y from 'yjs'
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import PeopleInput from '@/components/PeopleInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import {
  createEntryMap,
  readEntry,
  rosterFromEntries,
  setEntryPeople,
  type LiveSession,
} from '@/lib/session'

const props = defineProps<{ session: LiveSession }>()

type Mode = 'list' | 'byEvent'
const mode = ref<Mode>(
  (localStorage.getItem('entriesMode') as Mode) || 'list',
)

const tick = shallowRef(0)
let observer: (() => void) | null = null

function bump() {
  tick.value++
}

onMounted(() => {
  observer = () => bump()
  props.session.entries.observeDeep(observer)
  bump()
})

onUnmounted(() => {
  if (observer) props.session.entries.unobserveDeep(observer)
})

const entries = computed(() => {
  void tick.value
  return props.session.entries.toArray().map((m) => readEntry(m))
})

const roster = computed(() => rosterFromEntries(entries.value))

const eventSections = computed(() => {
  const order: string[] = []
  const groups = new Map<string, { event: string; indexes: number[] }>()
  entries.value.forEach((entry, index) => {
    const event = entry.event.trim() || 'Untitled event'
    if (!groups.has(event)) {
      groups.set(event, { event, indexes: [] })
      order.push(event)
    }
    groups.get(event)!.indexes.push(index)
  })
  return order.map((key) => groups.get(key)!)
})

function setMode(next: Mode) {
  mode.value = next
  localStorage.setItem('entriesMode', next)
}

function addEntry(event = '') {
  props.session.doc.transact(() => {
    props.session.entries.push([createEntryMap({ event, people: [] })])
  })
}

function removeEntry(index: number) {
  props.session.doc.transact(() => {
    props.session.entries.delete(index, 1)
  })
}

function updateField(
  index: number,
  field: 'name' | 'event' | 'percentage',
  value: string,
) {
  const map = props.session.entries.get(index)
  if (!(map instanceof Y.Map)) return
  map.set(field, value)
}

function updatePeople(index: number, people: string[]) {
  const map = props.session.entries.get(index)
  if (!(map instanceof Y.Map)) return
  props.session.doc.transact(() => setEntryPeople(map, people))
}

function renameEventSection(oldEvent: string, nextEvent: string) {
  const trimmed = nextEvent.trim() || 'Untitled event'
  props.session.doc.transact(() => {
    props.session.entries.forEach((map) => {
      if (!(map instanceof Y.Map)) return
      const current = String(map.get('event') ?? '').trim() || 'Untitled event'
      if (current === oldEvent) map.set('event', trimmed)
    })
  })
}

function addEventSection() {
  addEntry('New event')
}
</script>

<template>
  <div class="stack">
    <div class="row bar">
      <p class="muted blurb">
        Enter acts and people. Use commas (or ; / new lines) between people.
        Press <kbd>Tab</kbd> to autofill a matching name.
      </p>
      <div class="switch" role="group" aria-label="Entry layout">
        <button
          type="button"
          class="switch-btn"
          :class="{ on: mode === 'list' }"
          @click="setMode('list')"
        >
          Flat list
        </button>
        <button
          type="button"
          class="switch-btn"
          :class="{ on: mode === 'byEvent' }"
          @click="setMode('byEvent')"
        >
          By event
        </button>
      </div>
    </div>

    <div v-if="mode === 'list'" class="panel">
      <div class="table">
        <div class="thead hide-sm">
          <span>Name</span>
          <span>Event</span>
          <span>People</span>
          <span>Lock %</span>
          <span />
        </div>
        <div
          v-for="(entry, index) in entries"
          :key="entry.id"
          class="trow"
        >
          <label class="mobile-label">Name</label>
          <input
            class="field"
            :value="entry.name"
            placeholder="optional title"
            @input="updateField(index, 'name', ($event.target as HTMLInputElement).value)"
          />
          <label class="mobile-label">Event</label>
          <input
            class="field"
            :value="entry.event"
            placeholder="event"
            @input="updateField(index, 'event', ($event.target as HTMLInputElement).value)"
          />
          <label class="mobile-label">People</label>
          <PeopleInput
            :model-value="entry.people"
            :roster="roster"
            @update:model-value="updatePeople(index, $event)"
          />
          <label class="mobile-label">Lock %</label>
          <input
            class="field"
            :value="entry.percentage"
            placeholder="%"
            @input="updateField(index, 'percentage', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="btn btn-ghost danger"
            type="button"
            @click="removeEntry(index)"
          >
            Remove
          </button>
        </div>
      </div>
      <div class="row actions">
        <AppButton @click="addEntry()">Add entry</AppButton>
      </div>
    </div>

    <div v-else class="stack">
      <div
        v-for="section in eventSections"
        :key="section.event"
        class="panel section"
      >
        <div class="section-head">
          <label class="label">Event section</label>
          <input
            class="field event-title"
            :value="section.event"
            @change="renameEventSection(section.event, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div
          v-for="index in section.indexes"
          :key="entries[index]!.id"
          class="act"
        >
          <input
            class="field"
            :value="entries[index]!.name"
            placeholder="optional title"
            @input="updateField(index, 'name', ($event.target as HTMLInputElement).value)"
          />
          <PeopleInput
            :model-value="entries[index]!.people"
            :roster="roster"
            @update:model-value="updatePeople(index, $event)"
          />
          <button
            class="btn btn-ghost danger"
            type="button"
            @click="removeEntry(index)"
          >
            Remove
          </button>
        </div>
        <AppButton
          variant="secondary"
          @click="addEntry(section.event === 'Untitled event' ? '' : section.event)"
        >
          Add act in section
        </AppButton>
      </div>
      <AppButton @click="addEventSection">Add event section</AppButton>
    </div>
  </div>
</template>

<style scoped>
.bar {
  justify-content: space-between;
  align-items: flex-start;
}
.blurb {
  margin: 0;
  max-width: 34rem;
  line-height: 1.4;
  font-size: 0.92rem;
}
kbd {
  font-family: var(--font-mono);
  font-size: 0.8em;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 1px 5px;
}
.switch {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 999px;
  overflow: hidden;
}
.switch-btn {
  border: 0;
  background: transparent;
  color: var(--muted);
  padding: 10px 14px;
  min-height: 40px;
}
.switch-btn.on {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  color: var(--ink);
}
.table {
  display: grid;
  gap: 10px;
}
.thead,
.trow {
  display: grid;
  gap: 8px;
}
@media (min-width: 900px) {
  .thead,
  .trow {
    grid-template-columns: 1.1fr 1fr 1.4fr 0.55fr auto;
    align-items: start;
  }
  .mobile-label {
    display: none;
  }
}
@media (max-width: 899px) {
  .hide-sm {
    display: none;
  }
  .trow {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px;
  }
  .mobile-label {
    font-size: 0.75rem;
    color: var(--muted);
  }
}
.thead {
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.actions {
  margin-top: 12px;
}
.section-head {
  margin-bottom: 10px;
}
.event-title {
  font-weight: 600;
}
.act {
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
}
@media (min-width: 700px) {
  .act {
    grid-template-columns: 1fr 1.4fr auto;
    align-items: start;
  }
}
.danger {
  color: var(--bad);
}
</style>
