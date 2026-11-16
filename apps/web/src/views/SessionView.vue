<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import SessionChrome from '@/components/SessionChrome.vue'
import {
  connectLiveSession,
  type LiveSession,
} from '@/lib/session'
import AnalysisTab from '@/views/AnalysisTab.vue'
import EntriesTab from '@/views/EntriesTab.vue'
import ShowTab from '@/views/ShowTab.vue'

const props = defineProps<{
  code: string
  title: string | null
}>()

const emit = defineEmits<{ leave: [] }>()

const tab = ref<'entries' | 'show' | 'analysis'>('entries')
const session = shallowRef<LiveSession | null>(null)
const connected = ref(false)
const synced = ref(false)

let live: LiveSession | null = null

const status = computed(() => {
  if (!connected.value) return 'Disconnected'
  if (!synced.value) return 'Connected — syncing…'
  return 'Connected — live'
})

function onStatus({ status: s }: { status: string }) {
  connected.value = s === 'connected'
}

function onSync(s: boolean) {
  synced.value = s
}

onMounted(() => {
  live = connectLiveSession(props.code)
  session.value = live
  live.provider.on('status', onStatus)
  live.provider.on('sync', onSync)
})

onUnmounted(() => {
  if (!live) return
  live.provider.off('status', onStatus)
  live.provider.off('sync', onSync)
  live.destroy()
  live = null
  session.value = null
})

function leave() {
  if (live) {
    live.provider.off('status', onStatus)
    live.provider.off('sync', onSync)
    live.destroy()
    live = null
  }
  session.value = null
  emit('leave')
}
</script>

<template>
  <div>
    <SessionChrome
      :code="code"
      :title="title"
      :status="status"
      :connected="connected && synced"
      @leave="leave"
    />

    <nav class="tabs" aria-label="Session sections">
      <button
        type="button"
        :class="{ on: tab === 'entries' }"
        @click="tab = 'entries'"
      >
        Entries
      </button>
      <button
        type="button"
        :class="{ on: tab === 'show' }"
        @click="tab = 'show'"
      >
        Show
      </button>
      <button
        type="button"
        :class="{ on: tab === 'analysis' }"
        @click="tab = 'analysis'"
      >
        Analysis
      </button>
    </nav>

    <EntriesTab v-if="session && tab === 'entries'" :session="session" />
    <ShowTab v-else-if="session && tab === 'show'" :session="session" />
    <AnalysisTab v-else-if="session && tab === 'analysis'" :session="session" />
  </div>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 14px;
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 8px 0;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px);
}
.tabs button {
  min-height: var(--touch);
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--muted);
  font-weight: 600;
}
.tabs button.on {
  color: var(--ink);
  border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
  background: color-mix(in srgb, var(--accent) 16%, var(--panel));
}
</style>
