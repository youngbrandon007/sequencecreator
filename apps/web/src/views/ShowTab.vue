<script setup lang="ts">
import Sortable from 'sortablejs'
import * as Y from 'yjs'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { randomId } from '@/lib/ids'
import {
  entryTitle,
  readEntry,
  readShowSlot,
  type LiveSession,
} from '@/lib/session'

const props = defineProps<{ session: LiveSession }>()

const tick = shallowRef(0)
const unusedEl = ref<HTMLElement | null>(null)
const showEl = ref<HTMLElement | null>(null)
const boardKey = ref(0)
let unusedSortable: Sortable | null = null
let showSortable: Sortable | null = null
let observer: (() => void) | null = null

function bump() {
  tick.value++
}

function remountBoard() {
  unusedSortable?.destroy()
  showSortable?.destroy()
  unusedSortable = null
  showSortable = null
  boardKey.value++
  void nextTick(setupSortables)
}

const entries = computed(() => {
  void tick.value
  return props.session.entries.toArray().map((m) => readEntry(m))
})

const showSlots = computed(() => {
  void tick.value
  return props.session.show.toArray().map((m) => readShowSlot(m))
})

const entryById = computed(() => {
  const map = new Map(entries.value.map((e) => [e.id, e]))
  return map
})

const usedIds = computed(() => new Set(showSlots.value.map((s) => s.entryId)))

const unused = computed(() =>
  entries.value.filter((e) => e.id && !usedIds.value.has(e.id)),
)

const orderedShow = computed(() =>
  showSlots.value
    .map((slot) => {
      const entry = entryById.value.get(slot.entryId)
      if (!entry) return null
      return { slotId: slot.id, entry }
    })
    .filter(Boolean) as { slotId: string; entry: ReturnType<typeof readEntry> }[],
)

onMounted(() => {
  observer = () => bump()
  props.session.entries.observeDeep(observer)
  props.session.show.observeDeep(observer)
  bump()
  void nextTick(setupSortables)
})

onUnmounted(() => {
  if (observer) {
    props.session.entries.unobserveDeep(observer)
    props.session.show.unobserveDeep(observer)
  }
  unusedSortable?.destroy()
  showSortable?.destroy()
})

watch([unused, orderedShow], async () => {
  await nextTick()
  setupSortables()
})

function setupSortables() {
  unusedSortable?.destroy()
  showSortable?.destroy()
  if (!unusedEl.value || !showEl.value) return

  unusedSortable = Sortable.create(unusedEl.value, {
    group: 'show-board',
    animation: 150,
    handle: '.handle',
    draggable: '.card',
    onAdd: (evt) => {
      const slotId = evt.item.getAttribute('data-slot-id')
      if (slotId) removeSlotById(slotId)
      remountBoard()
    },
  })

  showSortable = Sortable.create(showEl.value, {
    group: 'show-board',
    animation: 150,
    handle: '.handle',
    draggable: '.card',
    onAdd: (evt) => {
      const entryId = evt.item.getAttribute('data-entry-id')
      if (!entryId) return
      const to = evt.newIndex ?? props.session.show.length
      addEntryToShow(entryId, to)
      remountBoard()
    },
    onUpdate: (evt) => {
      const from = evt.oldIndex
      const to = evt.newIndex
      if (from == null || to == null || from === to) return
      moveShowItem(from, to)
      remountBoard()
    },
  })
}

function addEntryToShow(entryId: string, index: number) {
  props.session.doc.transact(() => {
    // prevent duplicates
    for (let i = 0; i < props.session.show.length; i++) {
      const slot = readShowSlot(props.session.show.get(i) as Y.Map<unknown>)
      if (slot.entryId === entryId) return
    }
    const map = new Y.Map<unknown>()
    map.set('id', randomId())
    map.set('entryId', entryId)
    const at = Math.max(0, Math.min(index, props.session.show.length))
    props.session.show.insert(at, [map])
  })
}

function removeSlotById(slotId: string) {
  props.session.doc.transact(() => {
    for (let i = 0; i < props.session.show.length; i++) {
      const slot = readShowSlot(props.session.show.get(i) as Y.Map<unknown>)
      if (slot.id === slotId) {
        props.session.show.delete(i, 1)
        return
      }
    }
  })
}

function moveShowItem(from: number, to: number) {
  props.session.doc.transact(() => {
    const item = props.session.show.get(from)
    if (!item) return
    props.session.show.delete(from, 1)
    props.session.show.insert(to, [item])
  })
}

function addAllUnused() {
  props.session.doc.transact(() => {
    for (const entry of unused.value) {
      const map = new Y.Map<unknown>()
      map.set('id', randomId())
      map.set('entryId', entry.id)
      props.session.show.push([map])
    }
  })
}

function clearShow() {
  props.session.doc.transact(() => {
    props.session.show.delete(0, props.session.show.length)
  })
}

function addTap(entryId: string) {
  addEntryToShow(entryId, props.session.show.length)
}
</script>

<template>
  <div class="stack">
    <div class="row bar">
      <p class="muted blurb">
        Drag unused acts into the show order. On mobile, use
        <strong>Add</strong> / <strong>Remove</strong> if dragging is awkward.
      </p>
      <div class="row">
        <AppButton variant="secondary" :disabled="!unused.length" @click="addAllUnused">
          Add all
        </AppButton>
        <AppButton variant="ghost" :disabled="!orderedShow.length" @click="clearShow">
          Clear show
        </AppButton>
      </div>
    </div>

    <div :key="boardKey" class="board">
      <section class="panel column">
        <h3>Unused ({{ unused.length }})</h3>
        <div ref="unusedEl" class="list">
          <article
            v-for="entry in unused"
            :key="entry.id"
            class="card"
            :data-entry-id="entry.id"
          >
            <button class="handle" type="button" aria-label="Drag">⋮⋮</button>
            <div class="body">
              <strong>{{ entryTitle(entry) }}</strong>
              <p class="muted meta">
                {{ entry.event || 'no event' }}
                <span v-if="entry.people.length"> · {{ entry.people.join(', ') }}</span>
              </p>
            </div>
            <button class="btn btn-secondary tap" type="button" @click="addTap(entry.id)">
              Add
            </button>
          </article>
          <p v-if="!unused.length" class="muted empty">All acts are in the show.</p>
        </div>
      </section>

      <section class="panel column">
        <h3>Show order ({{ orderedShow.length }})</h3>
        <div ref="showEl" class="list">
          <article
            v-for="(item, index) in orderedShow"
            :key="item.slotId"
            class="card"
            :data-entry-id="item.entry.id"
            :data-slot-id="item.slotId"
          >
            <button class="handle" type="button" aria-label="Drag">⋮⋮</button>
            <div class="num">{{ index + 1 }}</div>
            <div class="body">
              <strong>{{ entryTitle(item.entry) }}</strong>
              <p class="muted meta">
                {{ item.entry.event || 'no event' }}
                <span v-if="item.entry.people.length">
                  · {{ item.entry.people.join(', ') }}
                </span>
              </p>
            </div>
            <button
              class="btn btn-ghost tap danger"
              type="button"
              @click="removeSlotById(item.slotId)"
            >
              Remove
            </button>
          </article>
          <p v-if="!orderedShow.length" class="muted empty">
            Drag acts here to build the lineup.
          </p>
        </div>
      </section>
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
  max-width: 36rem;
  line-height: 1.4;
  font-size: 0.92rem;
}
.board {
  display: grid;
  gap: 12px;
}
@media (min-width: 860px) {
  .board {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
.column h3 {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  margin-bottom: 10px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
}
.card {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 8px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--bg-elevated);
}
.handle {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: grab;
  min-width: 32px;
  min-height: 40px;
}
.num {
  font-family: var(--font-mono);
  color: var(--muted);
  width: 1.5rem;
}
.body {
  min-width: 0;
}
.body strong {
  display: block;
  font-size: 0.95rem;
}
.meta {
  margin: 2px 0 0;
  font-size: 0.8rem;
}
.empty {
  margin: 8px 0;
  font-size: 0.9rem;
}
.danger {
  color: var(--bad);
}
@media (min-width: 860px) {
  .tap {
    /* drag is primary on desktop; keep tap as backup */
  }
}
</style>
