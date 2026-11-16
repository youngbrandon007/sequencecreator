<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import {
  analyzeShow,
  filterClose,
  type ShowAct,
} from '@/lib/analysis'
import {
  entryTitle,
  readEntry,
  readShowSlot,
  type LiveSession,
} from '@/lib/session'

const props = defineProps<{ session: LiveSession }>()

const maxBetween = ref(2)
const tick = shallowRef(0)
let observer: (() => void) | null = null

function bump() {
  tick.value++
}

onMounted(() => {
  observer = () => bump()
  props.session.entries.observeDeep(observer)
  props.session.show.observeDeep(observer)
  bump()
})

onUnmounted(() => {
  if (observer) {
    props.session.entries.unobserveDeep(observer)
    props.session.show.unobserveDeep(observer)
  }
})

const acts = computed<ShowAct[]>(() => {
  void tick.value
  const byId = new Map(
    props.session.entries.toArray().map((m) => {
      const e = readEntry(m)
      return [e.id, e] as const
    }),
  )
  return props.session.show
    .toArray()
    .map((m) => {
      const slot = readShowSlot(m)
      const entry = byId.get(slot.entryId)
      if (!entry) return null
      return {
        id: slot.id,
        title: entryTitle(entry),
        event: entry.event,
        people: entry.people,
      }
    })
    .filter(Boolean) as ShowAct[]
})

const analysis = computed(() => analyzeShow(acts.value))
const closePeople = computed(() =>
  filterClose(analysis.value.byPerson, maxBetween.value),
)
const closeEvents = computed(() =>
  filterClose(analysis.value.byEvent, maxBetween.value),
)
</script>

<template>
  <div class="stack">
    <div class="panel controls">
      <p class="muted blurb">
        Gaps between each person’s appearances in the current show order.
        “Entries between” is how many other acts sit between two of theirs.
      </p>
      <label class="label" for="close">
        Highlight when entries between ≤ {{ maxBetween }}
      </label>
      <input
        id="close"
        v-model.number="maxBetween"
        class="field range"
        type="range"
        min="0"
        max="8"
        step="1"
      />
    </div>

    <p v-if="acts.length < 2" class="panel muted">
      Add at least two acts to the show (Show tab) to see spacing analysis.
    </p>

    <template v-else>
      <section class="panel">
        <h3>Person spacing</h3>
        <div v-if="!Object.keys(analysis.byPerson).length" class="muted">
          No people on acts in the show yet.
        </div>
        <div
          v-for="(hits, person) in analysis.byPerson"
          :key="person"
          class="block"
        >
          <h4>{{ person }}</h4>
          <ul>
            <li v-for="(hit, i) in hits" :key="i" :class="{ close: hit.entriesBetween <= maxBetween }">
              Slot {{ hit.index + 1 }} → {{ hit.nextIndex + 1 }}:
              <strong>{{ hit.entriesBetween }}</strong>
              {{ hit.entriesBetween === 1 ? 'entry' : 'entries' }} between
              <span class="muted">
                ({{ acts[hit.index]?.title }} → {{ acts[hit.nextIndex]?.title }})
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section class="panel">
        <h3>Close person pairs (≤ {{ maxBetween }} between)</h3>
        <div v-if="!Object.keys(closePeople).length" class="muted">
          No close person repeats at this threshold.
        </div>
        <div v-for="(hits, person) in closePeople" :key="person" class="block">
          <h4>{{ person }}</h4>
          <ul>
            <li v-for="(hit, i) in hits" :key="i">
              {{ hit.entriesBetween }} between slots {{ hit.index + 1 }} and
              {{ hit.nextIndex + 1 }}
            </li>
          </ul>
        </div>
      </section>

      <details class="panel">
        <summary>Event spacing</summary>
        <div
          v-for="(hits, event) in analysis.byEvent"
          :key="event"
          class="block"
        >
          <h4>{{ event }}</h4>
          <ul>
            <li
              v-for="(hit, i) in hits"
              :key="i"
              :class="{ close: hit.entriesBetween <= maxBetween }"
            >
              Slot {{ hit.index + 1 }} → {{ hit.nextIndex + 1 }}:
              <strong>{{ hit.entriesBetween }}</strong> between
            </li>
          </ul>
          <p v-if="!hits.length" class="muted">Only one occurrence.</p>
        </div>
        <div v-if="Object.keys(closeEvents).length" class="block">
          <h4>Close events</h4>
          <ul>
            <li v-for="(hits, event) in closeEvents" :key="event">
              {{ event }}:
              <span v-for="(hit, i) in hits" :key="i">
                {{ hit.entriesBetween }} between #{{ hit.index + 1 }}–#{{ hit.nextIndex + 1
                }}<span v-if="i < hits.length - 1">; </span>
              </span>
            </li>
          </ul>
        </div>
      </details>
    </template>
  </div>
</template>

<style scoped>
.controls {
  display: grid;
  gap: 8px;
}
.blurb {
  margin: 0;
  line-height: 1.4;
  font-size: 0.92rem;
}
.range {
  max-width: 320px;
  padding-left: 0;
  padding-right: 0;
}
h3 {
  font-family: var(--font-sans);
  font-size: 1rem;
  margin-bottom: 10px;
}
h4 {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  margin: 0 0 6px;
  color: var(--accent);
}
.block + .block {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
ul {
  margin: 0;
  padding-left: 1.1rem;
}
li {
  margin: 4px 0;
  line-height: 1.35;
}
li.close {
  color: var(--warn);
}
details summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 10px;
}
</style>
